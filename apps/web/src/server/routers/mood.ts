import { z } from 'zod';
import { router, publicProcedure, onboardedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '@prisma/client';
import { getMoodSuggestions } from '../services/mood-engine';

const MoodTypeEnum = z.enum([
  'NOSTALGIC', 'ADVENTUROUS', 'HEARTBROKEN', 'HYPE', 'CHILL',
  'ROMANTIC', 'MYSTERIOUS', 'INSPIRED', 'MELANCHOLIC', 'COZY',
]);

// Rate limiter
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

export const moodRouter = router({
  setMood: onboardedProcedure
    .input(z.object({ mood: MoodTypeEnum }))
    .mutation(async ({ ctx, input }) => {
      checkRateLimit(`mood-set:${ctx.userId}`, 10);

      // Deactivate previous mood and create new one in a transaction
      const [, newMood] = await ctx.prisma.$transaction([
        ctx.prisma.userMood.updateMany({
          where: { userId: ctx.userId, isActive: true },
          data: { isActive: false },
        }),
        ctx.prisma.userMood.create({
          data: { userId: ctx.userId, mood: input.mood, isActive: true },
        }),
      ]);

      // Get community-based suggestions
      const suggestions = await getCommunitysuggestions(ctx.prisma, ctx.userId, input.mood);
      const moodTwins = await getMoodTwins(ctx.prisma, ctx.userId, input.mood);

      return { moodId: newMood.id, suggestions, moodTwins };
    }),

  getSuggestions: onboardedProcedure.query(async ({ ctx }) => {
    const activeMood = await ctx.prisma.userMood.findFirst({
      where: { userId: ctx.userId, isActive: true },
    });

    if (!activeMood) {
      return { suggestions: [], moodTwins: [] };
    }

    const suggestions = await getCommunitysuggestions(ctx.prisma, ctx.userId, activeMood.mood);
    const moodTwins = await getMoodTwins(ctx.prisma, ctx.userId, activeMood.mood);

    return { suggestions, moodTwins };
  }),

  getHistory: onboardedProcedure.query(async ({ ctx }) => {
    const moods = await ctx.prisma.userMood.findMany({
      where: { userId: ctx.userId },
      orderBy: { selectedAt: 'desc' },
    });

    return {
      history: moods.map((m) => ({
        id: m.id,
        mood: m.mood,
        isActive: m.isActive,
        selectedAt: m.selectedAt.toISOString(),
      })),
      currentMood: moods.find((m) => m.isActive)?.mood ?? null,
    };
  }),

  tagFilm: onboardedProcedure
    .input(z.object({ filmId: z.string().cuid(), mood: MoodTypeEnum }))
    .mutation(async ({ ctx, input }) => {
      const tag = await ctx.prisma.moodFilmTag.upsert({
        where: {
          filmId_mood_taggedById: {
            filmId: input.filmId,
            mood: input.mood,
            taggedById: ctx.userId,
          },
        },
        create: {
          filmId: input.filmId,
          mood: input.mood,
          taggedById: ctx.userId,
        },
        update: {},
      });

      return { success: true, tagId: tag.id };
    }),

  expressInterest: onboardedProcedure
    .input(z.object({ targetUserId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      if (input.targetUserId === ctx.userId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Cannot express interest in yourself' });
      }

      // Check blocks
      const block = await ctx.prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: ctx.userId, blockedUserId: input.targetUserId },
            { blockerId: input.targetUserId, blockedUserId: ctx.userId },
          ],
        },
      });
      if (block) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot interact with this user' });
      }

      // Create interest (idempotent)
      await ctx.prisma.interest.upsert({
        where: {
          fromUserId_toUserId: { fromUserId: ctx.userId, toUserId: input.targetUserId },
        },
        create: { fromUserId: ctx.userId, toUserId: input.targetUserId },
        update: {},
      });

      // Check for mutual interest
      const mutual = await ctx.prisma.interest.findUnique({
        where: {
          fromUserId_toUserId: { fromUserId: input.targetUserId, toUserId: ctx.userId },
        },
      });

      return { success: true, isMatch: !!mutual };
    }),

  /**
   * Public mood explore — no auth required.
   * Uses HuggingFace/Voyage AI + MongoDB Atlas Vector Search when configured,
   * falls back to TMDB genre-based discovery.
   * Ref: https://huggingface.co/blog/mongodb-community/hugging-face-mongodb-voyage-4-nano
   */
  explore: publicProcedure
    .input(z.object({ mood: MoodTypeEnum }))
    .query(async ({ input, ctx }) => {
      const ip = 'public-mood';
      checkRateLimit(`mood-explore:${ip}`, 20);

      // Try community suggestions if user is authenticated
      let communitySuggestions: Awaited<ReturnType<typeof getCommunitysuggestions>> = [];
      if (ctx.session?.user?.id) {
        try {
          communitySuggestions = await getCommunitysuggestions(ctx.prisma, ctx.session.user.id, input.mood);
        } catch {
          // Ignore if DB query fails for unauth
        }
      }

      // Always get AI/TMDB suggestions (works without auth)
      const aiSuggestions = await getMoodSuggestions(ctx.prisma, ctx.session?.user?.id ?? 'anonymous', input.mood as never);

      // Merge: community first, then AI (deduplicated)
      const seen = new Set(communitySuggestions.map((s) => s?.filmTitle?.toLowerCase()));
      const merged = [
        ...communitySuggestions.filter(Boolean),
        ...aiSuggestions.filter((s) => !seen.has(s.filmTitle.toLowerCase())),
      ];

      return { suggestions: merged.slice(0, 10), moodTwins: [] };
    }),
});

// Helper: get community-based mood suggestions
async function getCommunitysuggestions(
  prisma: PrismaClient,
  userId: string,
  mood: string,
) {
  // Get films tagged with this mood, ranked by tag count
  const taggedFilms = await prisma.moodFilmTag.groupBy({
    by: ['filmId'],
    where: { mood: mood as never },
    _count: { filmId: true },
    orderBy: { _count: { filmId: 'desc' } },
    take: 10,
  });

  if (taggedFilms.length === 0) return [];

  const filmIds = taggedFilms.map((t) => t.filmId);
  const films = await prisma.film.findMany({
    where: { id: { in: filmIds } },
    select: { id: true, title: true, year: true, posterPath: true },
  });

  const filmMap = new Map(films.map((f) => [f.id, f] as const));

  return taggedFilms
    .map((t) => {
      const film = filmMap.get(t.filmId);
      if (!film) return null;
      return {
        id: `${userId}-${film.id}-${mood}`,
        filmId: film.id,
        filmTitle: film.title,
        filmYear: film.year,
        filmPosterPath: film.posterPath,
        mood,
        matchExplanation: `This film matches your ${mood.toLowerCase()} vibe based on community tags`,
        matchStrength: Math.min(1, t._count.filmId / 10),
        source: 'community' as const,
      };
    })
    .filter(Boolean);
}

// Helper: get mood twins
async function getMoodTwins(
  prisma: PrismaClient,
  userId: string,
  mood: string,
) {
  // Find other users with the same active mood
  const twins = await prisma.userMood.findMany({
    where: {
      mood: mood as never,
      isActive: true,
      userId: { not: userId },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    take: 10,
  });

  // Exclude blocked users
  const blocked = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: userId },
        { blockedUserId: userId },
      ],
    },
    select: { blockerId: true, blockedUserId: true },
  });
  const blockedIds = new Set(blocked.map((b) => b.blockerId === userId ? b.blockedUserId : b.blockerId));

  return twins
    .filter((t) => !blockedIds.has(t.user.id))
    .map((t) => ({
      userId: t.user.id,
      displayName: t.user.name,
      image: t.user.image,
      sharedFilmCount: 0, // Would compute from watchlist overlap
      mood,
    }));
}
