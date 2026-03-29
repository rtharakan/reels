import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { FilmPreview } from '@reels/shared-types';

function filmToPreview(film: { id: string; tmdbId: number | null; title: string; year: number | null; posterPath: string | null; genreIds: number[] }): FilmPreview {
  return {
    id: film.id,
    tmdbId: film.tmdbId,
    title: film.title,
    year: film.year,
    posterUrl: film.posterPath ? `https://image.tmdb.org/t/p/w500${film.posterPath}` : null,
    genreIds: film.genreIds,
  };
}

const onboardingInputSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.number().int().min(17),
  location: z.string().min(1).max(100),
  bio: z.string().min(1).max(500),
  intent: z.enum(['FRIENDS', 'DATING', 'BOTH']),
  letterboxdUsername: z.string().optional(),
  prompts: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1).max(300),
  })).min(1).max(3),
  topFilmIds: z.array(z.string()).max(4).optional(),
  timezone: z.string(),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  age: z.number().int().min(17).optional(),
  location: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  intent: z.enum(['FRIENDS', 'DATING', 'BOTH']).optional(),
  letterboxdUsername: z.string().optional(),
  prompts: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1).max(300),
  })).min(1).max(3).optional(),
  topFilmIds: z.array(z.string()).max(4).optional(),
  profilePhotos: z.array(z.string()).max(6).optional(),
  timezone: z.string().optional(),
});

export const userRouter = router({
  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
    });

    if (!user || user.deletedAt) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const watchlistCount = await ctx.prisma.watchlistEntry.count({
      where: { userId: ctx.userId },
    });

    let topFilms: FilmPreview[] = [];
    if (user.topFilmIds.length > 0) {
      const films = await ctx.prisma.film.findMany({
        where: { id: { in: user.topFilmIds } },
      });
      topFilms = films.map(filmToPreview);
    }

    return {
      id: user.id,
      name: user.name,
      age: user.age ?? 0,
      location: user.location ?? '',
      bio: user.bio,
      intent: user.intent ?? 'BOTH',
      letterboxdUsername: user.letterboxdUsername,
      profilePhotos: user.profilePhotos,
      prompts: (user.prompts as { question: string; answer: string }[]) ?? [],
      topFilms,
      watchlistCount,
      isOnboarded: !!user.onboardingCompletedAt,
      createdAt: user.createdAt.toISOString(),
    };
  }),

  getById: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: input.userId },
      });

      if (!user || user.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      let topFilms: FilmPreview[] = [];
      if (user.topFilmIds.length > 0) {
        const films = await ctx.prisma.film.findMany({
          where: { id: { in: user.topFilmIds } },
        });
        topFilms = films.map(filmToPreview);
      }

      return {
        id: user.id,
        name: user.name,
        age: user.age ?? 0,
        location: user.location ?? '',
        bio: user.bio,
        intent: user.intent ?? 'BOTH',
        profilePhotos: user.profilePhotos,
        prompts: (user.prompts as { question: string; answer: string }[]) ?? [],
        topFilms,
      };
    }),

  completeOnboarding: protectedProcedure
    .input(onboardingInputSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data: {
          name: input.name,
          age: input.age,
          location: input.location,
          bio: input.bio,
          intent: input.intent,
          letterboxdUsername: input.letterboxdUsername || null,
          prompts: input.prompts,
          topFilmIds: input.topFilmIds ?? [],
          timezone: input.timezone,
          privacyPolicyConsentedAt: new Date(),
          onboardingCompletedAt: new Date(),
        },
      });

      return {
        id: user.id,
        name: user.name,
        age: user.age ?? 0,
        location: user.location ?? '',
        bio: user.bio,
        intent: user.intent ?? 'BOTH',
        letterboxdUsername: user.letterboxdUsername,
        profilePhotos: user.profilePhotos,
        prompts: (user.prompts as { question: string; answer: string }[]) ?? [],
        topFilms: [] as FilmPreview[],
        watchlistCount: 0,
        isOnboarded: true,
        createdAt: user.createdAt.toISOString(),
      };
    }),

  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const data: Record<string, unknown> = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.age !== undefined) data.age = input.age;
      if (input.location !== undefined) data.location = input.location;
      if (input.bio !== undefined) data.bio = input.bio;
      if (input.intent !== undefined) data.intent = input.intent;
      if (input.letterboxdUsername !== undefined) data.letterboxdUsername = input.letterboxdUsername;
      if (input.prompts !== undefined) data.prompts = input.prompts;
      if (input.topFilmIds !== undefined) data.topFilmIds = input.topFilmIds;
      if (input.profilePhotos !== undefined) data.profilePhotos = input.profilePhotos;
      if (input.timezone !== undefined) data.timezone = input.timezone;

      const user = await ctx.prisma.user.update({
        where: { id: ctx.userId },
        data,
      });

      const watchlistCount = await ctx.prisma.watchlistEntry.count({
        where: { userId: ctx.userId },
      });

      let topFilms: FilmPreview[] = [];
      if (user.topFilmIds.length > 0) {
        const films = await ctx.prisma.film.findMany({
          where: { id: { in: user.topFilmIds } },
        });
        topFilms = films.map(filmToPreview);
      }

      return {
        id: user.id,
        name: user.name,
        age: user.age ?? 0,
        location: user.location ?? '',
        bio: user.bio,
        intent: user.intent ?? 'BOTH',
        letterboxdUsername: user.letterboxdUsername,
        profilePhotos: user.profilePhotos,
        prompts: (user.prompts as { question: string; answer: string }[]) ?? [],
        topFilms,
        watchlistCount,
        isOnboarded: !!user.onboardingCompletedAt,
        createdAt: user.createdAt.toISOString(),
      };
    }),

  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.user.update({
      where: { id: ctx.userId },
      data: { deletedAt: new Date() },
    });

    // Clean up match scores and allocations
    await ctx.prisma.matchScore.deleteMany({
      where: { OR: [{ userId: ctx.userId }, { candidateId: ctx.userId }] },
    });

    return { success: true };
  }),

  exportData: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: { id: ctx.userId },
      include: {
        watchlistEntries: { include: { film: true } },
        matchesAsA: true,
        matchesAsB: true,
        interestsSent: true,
      },
    });

    return {
      profile: user,
      exportedAt: new Date().toISOString(),
    };
  }),
});
