import type { PrismaClient } from '@prisma/client';
import { computeMatchScore } from '@reels/matching-engine';

export async function recomputeMatchScores(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  // Get user's watchlist with films
  const userEntries = await prisma.watchlistEntry.findMany({
    where: { userId },
    include: { film: true },
  });

  if (userEntries.length < 5) return; // Not eligible

  const userFilmIds = userEntries
    .filter((e) => e.film.tmdbId !== null)
    .map((e) => e.film.id);
  const userGenres = userEntries
    .filter((e) => e.film.tmdbId !== null)
    .map((e) => e.film.genreIds);

  // Get all other eligible users
  const otherUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      deletedAt: null,
      onboardingCompletedAt: { not: null },
    },
    select: { id: true },
  });

  for (const other of otherUsers) {
    const otherEntries = await prisma.watchlistEntry.findMany({
      where: { userId: other.id },
      include: { film: true },
    });

    if (otherEntries.length < 5) continue;

    const otherFilmIds = otherEntries
      .filter((e) => e.film.tmdbId !== null)
      .map((e) => e.film.id);
    const otherGenres = otherEntries
      .filter((e) => e.film.tmdbId !== null)
      .map((e) => e.film.genreIds);

    const score = computeMatchScore({
      userAFilmIds: userFilmIds,
      userAGenres: userGenres,
      userBFilmIds: otherFilmIds,
      userBGenres: otherGenres,
    });

    // Upsert score both directions
    const scoreData = {
      filmOverlap: score.filmOverlap,
      genreSimilarity: score.genreSimilarity,
      totalScore: score.totalScore,
      sharedFilmIds: score.sharedFilmIds,
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
