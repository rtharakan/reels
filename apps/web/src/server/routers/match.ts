import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { FilmPreview } from '@reels/shared-types';

const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Science Fiction',
  10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

export const matchRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const matches = await ctx.prisma.match.findMany({
      where: {
        OR: [
          { userAId: ctx.userId },
          { userBId: ctx.userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    const otherUserIds = matches.map((m) =>
      m.userAId === ctx.userId ? m.userBId : m.userAId,
    );

    const otherUsers = await ctx.prisma.user.findMany({
      where: { id: { in: otherUserIds } },
      select: { id: true, name: true, profilePhotos: true },
    });
    const userMap = new Map(otherUsers.map((u) => [u.id, u]));

    return matches.map((m) => {
      const otherId = m.userAId === ctx.userId ? m.userBId : m.userAId;
      const otherUser = userMap.get(otherId);
      return {
        matchId: m.id,
        otherUser: {
          id: otherId,
          name: otherUser?.name ?? 'Unknown',
          profilePhotos: otherUser?.profilePhotos ?? [],
        },
        sharedFilmCount: m.sharedFilmIds.length,
        score: m.score,
        createdAt: m.createdAt.toISOString(),
      };
    });
  }),

  getById: protectedProcedure
    .input(z.object({ matchId: z.string() }))
    .query(async ({ ctx, input }) => {
      const match = await ctx.prisma.match.findUnique({
        where: { id: input.matchId },
      });

      if (!match) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Match not found' });
      }

      if (match.userAId !== ctx.userId && match.userBId !== ctx.userId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your match' });
      }

      const otherId = match.userAId === ctx.userId ? match.userBId : match.userAId;
      const otherUser = await ctx.prisma.user.findUnique({
        where: { id: otherId },
      });

      if (!otherUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Get shared films
      const sharedFilms = match.sharedFilmIds.length > 0
        ? await ctx.prisma.film.findMany({
            where: { id: { in: match.sharedFilmIds } },
          })
        : [];

      // Compute genre overlap from shared films
      const genreCounts = new Map<number, number>();
      for (const film of sharedFilms) {
        for (const gid of film.genreIds) {
          genreCounts.set(gid, (genreCounts.get(gid) ?? 0) + 1);
        }
      }
      const genreOverlap = Array.from(genreCounts.entries())
        .map(([gid, count]) => ({
          genreName: TMDB_GENRE_MAP[gid] ?? `Genre ${gid}`,
          count,
        }))
        .sort((a, b) => b.count - a.count);

      // Get other user's top films
      let topFilms: FilmPreview[] = [];
      if (otherUser.topFilmIds.length > 0) {
        const films = await ctx.prisma.film.findMany({
          where: { id: { in: otherUser.topFilmIds } },
        });
        topFilms = films.map((f) => ({
          id: f.id,
          tmdbId: f.tmdbId,
          title: f.title,
          year: f.year,
          posterUrl: f.posterPath ? `https://image.tmdb.org/t/p/w500${f.posterPath}` : null,
          genreIds: f.genreIds,
        }));
      }

      return {
        matchId: match.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name,
          age: otherUser.age ?? 0,
          location: otherUser.location ?? '',
          bio: otherUser.bio,
          intent: otherUser.intent ?? 'BOTH',
          profilePhotos: otherUser.profilePhotos,
          prompts: (otherUser.prompts as { question: string; answer: string }[]) ?? [],
          topFilms,
        },
        score: match.score,
        sharedFilms: sharedFilms.map((f) => ({
          id: f.id,
          tmdbId: f.tmdbId,
          title: f.title,
          year: f.year,
          posterUrl: f.posterPath ? `https://image.tmdb.org/t/p/w500${f.posterPath}` : null,
          genreIds: f.genreIds,
        })),
        genreOverlap,
        createdAt: match.createdAt.toISOString(),
      };
    }),
});
