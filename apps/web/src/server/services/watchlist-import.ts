import type { PrismaClient } from '@prisma/client';
import { scrapeWatchlist, normalizeFilms } from '@reels/letterboxd-scraper';
import type { ImportResult } from '@reels/shared-types';

export async function importWatchlist(
  prisma: PrismaClient,
  userId: string,
  letterboxdUsername: string,
): Promise<ImportResult> {
  // Scrape watchlist
  const scrapeResult = await scrapeWatchlist(letterboxdUsername);

  if (scrapeResult.isPrivate || scrapeResult.error) {
    throw new Error(scrapeResult.error ?? 'Failed to scrape watchlist');
  }

  if (scrapeResult.films.length === 0) {
    return {
      totalScraped: 0,
      totalResolved: 0,
      totalUnresolved: 0,
      isEligibleForMatching: false,
    };
  }

  // Normalize via TMDB
  const apiToken = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!apiToken) {
    throw new Error('TMDB API token not configured');
  }

  const normalizedResults = await normalizeFilms(scrapeResult.films, apiToken);

  let totalResolved = 0;
  let totalUnresolved = 0;
  const filmIds: string[] = [];

  for (const result of normalizedResults) {
    if (!result.resolved) {
      totalUnresolved++;
      continue;
    }

    totalResolved++;

    // Upsert film record
    const film = await prisma.film.upsert({
      where: { tmdbId: result.resolved.tmdbId },
      create: {
        tmdbId: result.resolved.tmdbId,
        title: result.resolved.title,
        year: result.resolved.year,
        posterPath: result.resolved.posterPath,
        genreIds: result.resolved.genreIds,
      },
      update: {
        title: result.resolved.title,
        year: result.resolved.year,
        posterPath: result.resolved.posterPath,
        genreIds: result.resolved.genreIds,
      },
    });

    filmIds.push(film.id);
  }

  // Get existing entries
  const existingEntries = await prisma.watchlistEntry.findMany({
    where: { userId },
    select: { id: true, filmId: true },
  });
  const existingFilmIds = new Set(existingEntries.map((e) => e.filmId));
  const newFilmIds = new Set(filmIds);

  // Remove entries no longer in watchlist
  const entriesToRemove = existingEntries.filter((e) => !newFilmIds.has(e.filmId));
  if (entriesToRemove.length > 0) {
    await prisma.watchlistEntry.deleteMany({
      where: { id: { in: entriesToRemove.map((e) => e.id) } },
    });
  }

  // Add new entries
  const filmsToAdd = filmIds.filter((id) => !existingFilmIds.has(id));
  if (filmsToAdd.length > 0) {
    await prisma.watchlistEntry.createMany({
      data: filmsToAdd.map((filmId) => ({ userId, filmId })),
      skipDuplicates: true,
    });
  }

  // Update user's letterboxd username
  await prisma.user.update({
    where: { id: userId },
    data: { letterboxdUsername },
  });

  return {
    totalScraped: scrapeResult.films.length,
    totalResolved,
    totalUnresolved,
    isEligibleForMatching: totalResolved >= 5,
  };
}
