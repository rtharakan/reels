import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { importWatchlist } from '../services/watchlist-import';
import { recomputeMatchScores } from '../services/match-score';
import type { FilmPreview } from '@reels/shared-types';

export const watchlistRouter = router({
  import: protectedProcedure
    .input(z.object({ letterboxdUsername: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const result = await importWatchlist(ctx.prisma, ctx.userId, input.letterboxdUsername);

      // Trigger match score recomputation in background
      recomputeMatchScores(ctx.prisma, ctx.userId).catch(console.error);

      return result;
    }),

  getMyWatchlist: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const totalCount = await ctx.prisma.watchlistEntry.count({
        where: { userId: ctx.userId },
      });

      const entries = await ctx.prisma.watchlistEntry.findMany({
        where: { userId: ctx.userId },
        include: { film: true },
        orderBy: { importedAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      });

      let nextCursor: string | null = null;
      if (entries.length > input.limit) {
        const nextItem = entries.pop()!;
        nextCursor = nextItem.id;
      }

      return {
        items: entries.map((entry) => ({
          id: entry.id,
          film: {
            id: entry.film.id,
            tmdbId: entry.film.tmdbId,
            title: entry.film.title,
            year: entry.film.year,
            posterUrl: entry.film.posterPath
              ? `https://image.tmdb.org/t/p/w500${entry.film.posterPath}`
              : null,
            genreIds: entry.film.genreIds,
          } satisfies FilmPreview,
          importedAt: entry.importedAt.toISOString(),
        })),
        nextCursor,
        totalCount,
      };
    }),
});
