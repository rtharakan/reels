import type { PrismaClient } from '@prisma/client';
import { computeEnhancedMatchScore } from '@reels/matching-engine';

type FilmEntryWithFilm = {
  film: { id: string; tmdbId: number | null; genreIds: number[] };
};

type RatingEntryWithFilm = FilmEntryWithFilm & {
  rating: number;
};

function extractFilmData(entries: FilmEntryWithFilm[]) {
  const resolved = entries.filter((e) => e.film.tmdbId !== null);
  return {
    ids: resolved.map((e) => e.film.id),
    genres: resolved.map((e) => e.film.genreIds),
  };
}

async function getUserFilmSignals(prisma: PrismaClient, userId: string) {
  const [watchlist, watched, ratings, liked] = await Promise.all([
    prisma.watchlistEntry.findMany({
      where: { userId },
      include: { film: true },
    }),
    prisma.watchedEntry.findMany({
      where: { userId },
      include: { film: true },
    }),
    prisma.ratingEntry.findMany({
      where: { userId },
      include: { film: true },
    }),
    prisma.likedEntry.findMany({
      where: { userId },
      include: { film: true },
    }),
  ]);

  const highRated = (ratings as RatingEntryWithFilm[]).filter((e) => e.rating >= 4.0);

  return {
    watchlist: extractFilmData(watchlist),
    watched: extractFilmData(watched),
    highRated: extractFilmData(highRated),
    liked: extractFilmData(liked),
    totalFilmCount: watchlist.length + watched.length,
  };
}

export async function recomputeMatchScores(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  const userSignals = await getUserFilmSignals(prisma, userId);

  // Need at least 5 films across all sources to be eligible
  if (userSignals.totalFilmCount < 5) return;

  const otherUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      deletedAt: null,
      onboardingCompletedAt: { not: null },
    },
    select: { id: true },
  });

  for (const other of otherUsers) {
    const otherSignals = await getUserFilmSignals(prisma, other.id);

    if (otherSignals.totalFilmCount < 5) continue;

    const score = computeEnhancedMatchScore({
      userAWatchlistIds: userSignals.watchlist.ids,
      userAWatchlistGenres: userSignals.watchlist.genres,
      userBWatchlistIds: otherSignals.watchlist.ids,
      userBWatchlistGenres: otherSignals.watchlist.genres,
      userAWatchedIds: userSignals.watched.ids,
      userAWatchedGenres: userSignals.watched.genres,
      userBWatchedIds: otherSignals.watched.ids,
      userBWatchedGenres: otherSignals.watched.genres,
      userAHighRatedIds: userSignals.highRated.ids,
      userAHighRatedGenres: userSignals.highRated.genres,
      userBHighRatedIds: otherSignals.highRated.ids,
      userBHighRatedGenres: otherSignals.highRated.genres,
      userALikedIds: userSignals.liked.ids,
      userALikedGenres: userSignals.liked.genres,
      userBLikedIds: otherSignals.liked.ids,
      userBLikedGenres: otherSignals.liked.genres,
    });

    const scoreData = {
      filmOverlap: score.watchlistOverlap,
      genreSimilarity: score.genreSimilarity,
      totalScore: score.totalScore,
      sharedFilmIds: score.sharedFilmIds,
      likedOverlap: score.likedOverlap,
      ratedOverlap: score.ratedOverlap,
      watchedOverlap: score.watchedOverlap,
      watchlistOverlap: score.watchlistOverlap,
      sharedLikedIds: score.sharedLikedIds,
      sharedRatedIds: score.sharedRatedIds,
      sharedWatchedIds: score.sharedWatchedIds,
      computedAt: new Date(),
    };

    await prisma.matchScore.upsert({
      where: { userId_candidateId: { userId, candidateId: other.id } },
      create: { userId, candidateId: other.id, ...scoreData },
      update: scoreData,
    });

    await prisma.matchScore.upsert({
      where: { userId_candidateId: { userId: other.id, candidateId: userId } },
      create: { userId: other.id, candidateId: userId, ...scoreData },
      update: scoreData,
    });
  }
}
