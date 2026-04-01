import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { fetchCityScreenings, type ExploreScreening } from '../services/explore-screenings';

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxPerMinute: number) {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || entry.resetAt < now) {
    rateLimits.set(key, { count: 1, resetAt: now + 60_000 });
    return;
  }
  if (entry.count >= maxPerMinute) {
    throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded' });
  }
  entry.count++;
}

// Simple in-memory TMDB search cache (10 min TTL)
const tmdbCache = new Map<string, { data: unknown; expiresAt: number }>();

export const pickerRouter = router({
  searchFilms: publicProcedure
    .input(z.object({ query: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
      const cacheKey = `tmdb:${input.query.toLowerCase().trim()}`;
      const cached = tmdbCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.data as { results: Array<{ tmdbId: number; title: string; year: number | null; posterPath: string | null; overview: string | null }> };
      }

      const token = process.env.TMDB_API_READ_ACCESS_TOKEN ?? process.env.TMDB_API_TOKEN;
      if (!token) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'TMDB API token not configured' });
      }

      const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(input.query)}&language=en-US&page=1`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'TMDB search failed' });
      }

      const data = await res.json();
      const results = (data.results ?? []).slice(0, 10).map((r: Record<string, unknown>) => ({
        tmdbId: r.id as number,
        title: r.title as string,
        year: r.release_date ? parseInt((r.release_date as string).slice(0, 4), 10) : null,
        posterPath: r.poster_path as string | null,
        overview: r.overview as string | null,
      }));

      const result = { results };
      tmdbCache.set(cacheKey, { data: result, expiresAt: Date.now() + 10 * 60 * 1000 });
      return result;
    }),

  getShowtimes: publicProcedure
    .input(
      z.object({
        filmTitle: z.string().min(1).max(500),
        city: z.string().min(1).max(100).optional(),
        cinema: z.string().min(1).max(200).optional(),
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      }),
    )
    .query(async ({ input }) => {
      const city = input.city ?? 'amsterdam';
      try {
        const allScreenings = await fetchCityScreenings(city);
        const normalizeTitle = (t: string) =>
          t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

        const normInput = normalizeTitle(input.filmTitle);
        let filtered = allScreenings.filter((s) => normalizeTitle(s.filmTitle).includes(normInput) || normInput.includes(normalizeTitle(s.filmTitle)));

        if (input.cinema) {
          const normCinema = input.cinema.toLowerCase();
          filtered = filtered.filter((s) => s.cinemaName.toLowerCase().includes(normCinema));
        }
        if (input.date) {
          filtered = filtered.filter((s) => s.date === input.date);
        }

        if (filtered.length === 0) {
          return { showtimes: [], source: 'manual' as const };
        }

        return {
          showtimes: filtered.map((s) => ({
            cinemaName: s.cinemaName,
            cinemaCity: s.cinemaCity,
            date: s.date,
            time: s.time,
            ticketUrl: s.ticketUrl ?? null,
          })),
          source: 'filmladder' as const,
        };
      } catch {
        return { showtimes: [], source: 'manual' as const };
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        filmTitle: z.string().min(1).max(500),
        filmTmdbId: z.number().int().positive().optional(),
        filmPosterPath: z.string().optional(),
        filmYear: z.number().int().min(1888).max(2030).optional(),
        pathway: z.enum(['FILM_FIRST', 'FULLY_SPECIFIED']),
        city: z.string().max(100).optional(),
        cinema: z.string().max(200).optional(),
        targetDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        showtimes: z
          .array(
            z.object({
              cinemaName: z.string().min(1).max(200),
              cinemaCity: z.string().min(1).max(100),
              date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
              time: z.string().regex(/^\d{2}:\d{2}$/),
              ticketUrl: z.string().url().optional(),
              isManualEntry: z.boolean().default(false),
            }),
          )
          .min(1)
          .max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkRateLimit(`picker-create:${ctx.userId}`, 5);

      const plan = await ctx.prisma.pickerPlan.create({
        data: {
          organizerId: ctx.userId,
          filmTitle: input.filmTitle,
          filmTmdbId: input.filmTmdbId,
          filmPosterPath: input.filmPosterPath,
          filmYear: input.filmYear,
          pathway: input.pathway,
          city: input.city,
          cinema: input.cinema,
          targetDate: input.targetDate,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          showtimes: {
            create: input.showtimes.map((s) => ({
              cinemaName: s.cinemaName,
              cinemaCity: s.cinemaCity,
              date: s.date,
              time: s.time,
              ticketUrl: s.ticketUrl,
              isManualEntry: s.isManualEntry,
            })),
          },
          participants: {
            create: {
              userId: ctx.userId,
              displayName: ctx.session.user.name ?? 'Organizer',
              isOrganizer: true,
            },
          },
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
      return {
        planId: plan.id,
        shareUrl: `${baseUrl}/picker/${plan.id}`,
        expiresAt: plan.expiresAt.toISOString(),
      };
    }),

  get: publicProcedure
    .input(z.object({ planId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.prisma.pickerPlan.findUnique({
        where: { id: input.planId },
        include: {
          organizer: { select: { id: true, name: true } },
          showtimes: {
            include: {
              votes: { select: { status: true } },
            },
          },
          participants: {
            select: { id: true, displayName: true, isOrganizer: true, userId: true, sessionToken: true },
          },
          confirmedShowtime: true,
        },
      });

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' });
      }

      // Determine current participant
      let currentParticipantId: string | null = null;
      if (ctx.userId) {
        const participant = plan.participants.find((p) => p.userId === ctx.userId);
        if (participant) currentParticipantId = participant.id;
      }

      return {
        id: plan.id,
        filmTitle: plan.filmTitle,
        filmTmdbId: plan.filmTmdbId,
        filmPosterPath: plan.filmPosterPath,
        filmYear: plan.filmYear,
        pathway: plan.pathway,
        status: plan.status,
        organizer: { id: plan.organizer.id, name: plan.organizer.name },
        showtimes: plan.showtimes.map((s) => ({
          id: s.id,
          cinemaName: s.cinemaName,
          cinemaCity: s.cinemaCity,
          date: s.date,
          time: s.time,
          ticketUrl: s.ticketUrl,
          voteCount: {
            available: s.votes.filter((v) => v.status === 'AVAILABLE').length,
            unavailable: s.votes.filter((v) => v.status === 'UNAVAILABLE').length,
            maybe: s.votes.filter((v) => v.status === 'MAYBE').length,
          },
        })),
        participants: plan.participants.map((p) => ({
          id: p.id,
          displayName: p.displayName,
          isOrganizer: p.isOrganizer,
        })),
        confirmedShowtime: plan.confirmedShowtime
          ? {
              id: plan.confirmedShowtime.id,
              cinemaName: plan.confirmedShowtime.cinemaName,
              cinemaCity: plan.confirmedShowtime.cinemaCity,
              date: plan.confirmedShowtime.date,
              time: plan.confirmedShowtime.time,
              ticketUrl: plan.confirmedShowtime.ticketUrl,
            }
          : null,
        expiresAt: plan.expiresAt.toISOString(),
        createdAt: plan.createdAt.toISOString(),
        currentParticipantId,
      };
    }),

  join: publicProcedure
    .input(
      z.object({
        planId: z.string().cuid(),
        displayName: z
          .string()
          .min(1)
          .max(50)
          .regex(/^[a-zA-Z0-9\s\-_.]+$/),
        guestSessionToken: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.pickerPlan.findUnique({
        where: { id: input.planId },
        select: { status: true },
      });

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' });
      }
      if (plan.status === 'EXPIRED' || plan.status === 'ARCHIVED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Plan is no longer active' });
      }

      // Authenticated user
      if (ctx.userId) {
        const participant = await ctx.prisma.pickerParticipant.upsert({
          where: { planId_userId: { planId: input.planId, userId: ctx.userId } },
          create: {
            planId: input.planId,
            userId: ctx.userId,
            displayName: input.displayName,
          },
          update: { displayName: input.displayName },
        });
        return { participantId: participant.id, sessionToken: null };
      }

      // Guest — check if returning guest
      if (input.guestSessionToken) {
        const existing = await ctx.prisma.pickerParticipant.findFirst({
          where: { planId: input.planId, sessionToken: input.guestSessionToken },
        });
        if (existing) {
          return { participantId: existing.id, sessionToken: existing.sessionToken };
        }
      }

      // New guest
      const sessionToken = `guest_${crypto.randomUUID()}`;
      const participant = await ctx.prisma.pickerParticipant.create({
        data: {
          planId: input.planId,
          displayName: input.displayName,
          sessionToken,
        },
      });

      return { participantId: participant.id, sessionToken };
    }),

  vote: publicProcedure
    .input(
      z.object({
        participantId: z.string().cuid(),
        votes: z
          .array(
            z.object({
              showtimeId: z.string().cuid(),
              status: z.enum(['AVAILABLE', 'UNAVAILABLE', 'MAYBE']),
            }),
          )
          .min(1)
          .max(50),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate participant exists and plan is in VOTING state
      const participant = await ctx.prisma.pickerParticipant.findUnique({
        where: { id: input.participantId },
        include: { plan: { select: { status: true } } },
      });

      if (!participant) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Participant not found' });
      }

      // Verify caller owns this participant (authenticated user or matching guest token)
      if (ctx.userId) {
        if (participant.userId !== ctx.userId) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your participant' });
        }
      } else if (!participant.sessionToken) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your participant' });
      }

      if (participant.plan.status !== 'VOTING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Voting is closed for this plan' });
      }

      checkRateLimit(`picker-vote:${input.participantId}`, 30);

      let updatedCount = 0;
      for (const vote of input.votes) {
        await ctx.prisma.pickerVote.upsert({
          where: {
            participantId_showtimeId: {
              participantId: input.participantId,
              showtimeId: vote.showtimeId,
            },
          },
          create: {
            participantId: input.participantId,
            showtimeId: vote.showtimeId,
            status: vote.status,
          },
          update: { status: vote.status },
        });
        updatedCount++;
      }

      return { success: true, updatedCount };
    }),

  confirm: protectedProcedure
    .input(
      z.object({
        planId: z.string().cuid(),
        showtimeId: z.string().cuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.pickerPlan.findUnique({
        where: { id: input.planId },
        select: { organizerId: true, status: true },
      });

      if (!plan) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plan not found' });
      }
      if (plan.organizerId !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only the organizer can confirm' });
      }
      if (plan.status !== 'VOTING') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Plan is not in voting state' });
      }

      const showtime = await ctx.prisma.pickerShowtime.findUnique({
        where: { id: input.showtimeId },
      });

      if (!showtime || showtime.planId !== input.planId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Showtime does not belong to this plan' });
      }

      await ctx.prisma.pickerPlan.update({
        where: { id: input.planId },
        data: {
          status: 'CONFIRMED',
          confirmedShowtimeId: input.showtimeId,
        },
      });

      return {
        success: true,
        confirmedShowtime: {
          cinemaName: showtime.cinemaName,
          cinemaCity: showtime.cinemaCity,
          date: showtime.date,
          time: showtime.time,
          ticketUrl: showtime.ticketUrl,
        },
      };
    }),

  myPlans: protectedProcedure.query(async ({ ctx }) => {
    const plans = await ctx.prisma.pickerPlan.findMany({
      where: {
        OR: [
          { organizerId: ctx.userId },
          { participants: { some: { userId: ctx.userId } } },
        ],
      },
      include: {
        _count: { select: { participants: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      plans: plans.map((p) => ({
        id: p.id,
        filmTitle: p.filmTitle,
        filmPosterPath: p.filmPosterPath,
        status: p.status,
        participantCount: p._count.participants,
        isOrganizer: p.organizerId === ctx.userId,
        createdAt: p.createdAt.toISOString(),
        expiresAt: p.expiresAt.toISOString(),
      })),
    };
  }),
});
