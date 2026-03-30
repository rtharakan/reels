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

async function batchGetUserFilmSignals(prisma: PrismaClient, userIds: string[]) {
  if (userIds.length === 0) return new Map<string, Awaited<ReturnType<typeof getUserFilmSignals>>>();

  // Batch-fetch all entries for all users at once (4 queries total instead of 4*N)
  const [allWatchlist, allWatched, allRatings, allLiked] = await Promise.all([
    prisma.watchlistEntry.findMany({
      where: { userId: { in: userIds } },
      include: { film: true },
    }),
    prisma.watchedEntry.findMany({
      where: { userId: { in: userIds } },
      include: { film: true },
    }),
    prisma.ratingEntry.findMany({
      where: { userId: { in: userIds } },
      include: { film: true },
    }),
    prisma.likedEntry.findMany({
      where: { userId: { in: userIds } },
      include: { film: true },
    }),
  ]);

  // Group by userId
  const watchlistByUser = new Map<string, FilmEntryWithFilm[]>();
  const watchedByUser = new Map<string, FilmEntryWithFilm[]>();
  const ratingsByUser = new Map<string, RatingEntryWithFilm[]>();
  const likedByUser = new Map<string, FilmEntryWithFilm[]>();

  for (const e of allWatchlist) (watchlistByUser.get(e.userId) ?? watchlistByUser.set(e.userId, []).get(e.userId)!).push(e);
  for (const e of allWatched) (watchedByUser.get(e.userId) ?? watchedByUser.set(e.userId, []).get(e.userId)!).push(e);
  for (const e of allRatings) (ratingsByUser.get(e.userId) ?? ratingsByUser.set(e.userId, []).get(e.userId)!).push(e as RatingEntryWithFilm);
  for (const e of allLiked) (likedByUser.get(e.userId) ?? likedByUser.set(e.userId, []).get(e.userId)!).push(e);

  const result = new Map<string, Awaited<ReturnType<typeof getUserFilmSignals>>>();
  for (const uid of userIds) {
    const watchlist = watchlistByUser.get(uid) ?? [];
    const watched = watchedByUser.get(uid) ?? [];
    const ratings = ratingsByUser.get(uid) ?? [];
    const liked = likedByUser.get(uid) ?? [];
    const highRated = ratings.filter((e) => e.rating >= 4.0);

    result.set(uid, {
      watchlist: extractFilmData(watchlist),
      watched: extractFilmData(watched),
      highRated: extractFilmData(highRated),
      liked: extractFilmData(liked),
      totalFilmCount: watchlist.length + watched.length,
    });
  }
  return result;
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

  // Batch-fetch all other users' signals in 4 queries instead of 4*N
  const otherIds = otherUsers.map((u) => u.id);
  const allSignals = await batchGetUserFilmSignals(prisma, otherIds);

  // Collect all upsert operations for batching
  const upsertOps: Parameters<typeof prisma.matchScore.upsert>[0][] = [];

  for (const other of otherUsers) {
    const otherSignals = allSignals.get(other.id);
    if (!otherSignals || otherSignals.totalFilmCount < 5) continue;

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

    upsertOps.push({
      where: { userId_candidateId: { userId, candidateId: other.id } },
      create: { userId, candidateId: other.id, ...scoreData },
      update: scoreData,
    });

    upsertOps.push({
      where: { userId_candidateId: { userId: other.id, candidateId: userId } },
      create: { userId: other.id, candidateId: userId, ...scoreData },
      update: scoreData,
    });
  }

  // Execute upserts in a transaction for atomicity and performance
  if (upsertOps.length > 0) {
    await prisma.$transaction(
      upsertOps.map((op) => prisma.matchScore.upsert(op))
    );
  }
}
