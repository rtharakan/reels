import type { PrismaClient } from '@prisma/client';
import { scrapeWatchlist, scrapeFilms, scrapeRatings, scrapeLikes, normalizeFilms } from '@reels/letterboxd-scraper';
import type { ScrapedFilm, ScrapedRatedFilm } from '@reels/letterboxd-scraper';
import type { EnhancedImportResult } from '@reels/shared-types';

async function syncEntries(
  prisma: PrismaClient,
  userId: string,
  newFilmIds: string[],
  table: 'watchlistEntry' | 'watchedEntry' | 'likedEntry',
) {
  const existing = await (prisma[table] as any).findMany({
    where: { userId },
    select: { id: true, filmId: true },
  });
  const existingFilmIds = new Set(existing.map((e: any) => e.filmId));
  const newSet = new Set(newFilmIds);

  const toRemove = existing.filter((e: any) => !newSet.has(e.filmId));
  if (toRemove.length > 0) {
    await (prisma[table] as any).deleteMany({
      where: { id: { in: toRemove.map((e: any) => e.id) } },
    });
  }

  const toAdd = newFilmIds.filter((id) => !existingFilmIds.has(id));
  if (toAdd.length > 0) {
    await (prisma[table] as any).createMany({
      data: toAdd.map((filmId) => ({ userId, filmId })),
      skipDuplicates: true,
    });
  }
}

async function syncRatingEntries(
  prisma: PrismaClient,
  userId: string,
  ratedFilms: { filmId: string; rating: number }[],
) {
  const existing = await prisma.ratingEntry.findMany({
    where: { userId },
    select: { id: true, filmId: true, rating: true },
  });
  const existingMap = new Map(existing.map((e) => [e.filmId, e]));
  const newSet = new Set(ratedFilms.map((r) => r.filmId));

  // Remove entries no longer present
  const toRemove = existing.filter((e) => !newSet.has(e.filmId));
  if (toRemove.length > 0) {
    await prisma.ratingEntry.deleteMany({
      where: { id: { in: toRemove.map((e) => e.id) } },
    });
  }

  // Split into creates and updates
  const toCreate: { userId: string; filmId: string; rating: number }[] = [];
  const toUpdate: { filmId: string; rating: number }[] = [];

  for (const { filmId, rating } of ratedFilms) {
    const existingEntry = existingMap.get(filmId);
    if (!existingEntry) {
      toCreate.push({ userId, filmId, rating });
    } else if (existingEntry.rating !== rating) {
      toUpdate.push({ filmId, rating });
    }
  }

  // Batch create new entries
  if (toCreate.length > 0) {
    await prisma.ratingEntry.createMany({
      data: toCreate,
      skipDuplicates: true,
    });
  }

  // Batch update changed ratings in a transaction
  if (toUpdate.length > 0) {
    await prisma.$transaction(
      toUpdate.map(({ filmId, rating }) =>
        prisma.ratingEntry.updateMany({
          where: { userId, filmId },
          data: { rating },
        })
      )
    );
  }
}

export async function importWatchlist(
  prisma: PrismaClient,
  userId: string,
  letterboxdUsername: string,
): Promise<EnhancedImportResult> {
  const apiToken = process.env.TMDB_API_READ_ACCESS_TOKEN;
  if (!apiToken) {
    throw new Error('TMDB API token not configured');
  }

  // Scrape all four Letterboxd data sources in parallel
  const [watchlistResult, filmsResult, ratingsResult, likesResult] = await Promise.all([
    scrapeWatchlist(letterboxdUsername),
    scrapeFilms(letterboxdUsername),
    scrapeRatings(letterboxdUsername),
    scrapeLikes(letterboxdUsername),
  ]);

  if (watchlistResult.isPrivate || watchlistResult.error) {
    throw new Error(watchlistResult.error ?? 'Failed to scrape profile');
  }

  const totalScraped = watchlistResult.films.length;

  // Resolve all unique films across all sources via TMDB
  const allFilmsMap = new Map<string, ScrapedFilm>();
  const ratingsBySlug = new Map<string, number>();

  for (const f of watchlistResult.films) allFilmsMap.set(f.slug, f);
  for (const f of filmsResult.films) allFilmsMap.set(f.slug, f);
  for (const f of ratingsResult.films) {
    allFilmsMap.set(f.slug, f);
    ratingsBySlug.set(f.slug, (f as ScrapedRatedFilm).rating);
  }
  for (const f of likesResult.films) allFilmsMap.set(f.slug, f);

  const allUniqueFilms = [...allFilmsMap.values()];
  const normalizedResults = await normalizeFilms(allUniqueFilms, apiToken);

  // Build slug → filmId map from resolved results
  const slugToFilmId = new Map<string, string>();
  let totalResolved = 0;
  let totalUnresolved = 0;

  for (let i = 0; i < allUniqueFilms.length; i++) {
    const result = normalizedResults[i];
    if (!result?.resolved) {
      totalUnresolved++;
      continue;
    }
    totalResolved++;

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

    slugToFilmId.set(allUniqueFilms[i]!.slug, film.id);
  }

  // Map each source's slugs to film IDs
  const watchlistIds = watchlistResult.films
    .map((f) => slugToFilmId.get(f.slug))
    .filter((id): id is string => id !== undefined);

  const watchedIds = filmsResult.films
    .map((f) => slugToFilmId.get(f.slug))
    .filter((id): id is string => id !== undefined);

  const likedIds = likesResult.films
    .map((f) => slugToFilmId.get(f.slug))
    .filter((id): id is string => id !== undefined);

  const ratedFilms = ratingsResult.films
    .map((f) => {
      const filmId = slugToFilmId.get(f.slug);
      if (!filmId) return null;
      return { filmId, rating: (f as ScrapedRatedFilm).rating };
    })
    .filter((r): r is { filmId: string; rating: number } => r !== null);

  // Sync all four entry types
  await syncEntries(prisma, userId, watchlistIds, 'watchlistEntry');
  await syncEntries(prisma, userId, watchedIds, 'watchedEntry');
  await syncEntries(prisma, userId, likedIds, 'likedEntry');
  await syncRatingEntries(prisma, userId, ratedFilms);

  // T105: SeenUser re-eligibility on watchlist re-import
  // When ≥30% of resolved films are new, prune SeenUser entries
  // so the user can be re-discovered by others with updated taste
  const allResolvedIds = new Set([...watchlistIds, ...watchedIds, ...likedIds, ...ratedFilms.map(r => r.filmId)]);
  const previousEntries = await prisma.watchlistEntry.findMany({
    where: { userId },
    select: { filmId: true },
  });
  const previousFilmIds = new Set(previousEntries.map(e => e.filmId));
  const newFilmIds = [...allResolvedIds].filter(id => !previousFilmIds.has(id));
  const newRatio = previousFilmIds.size > 0 ? newFilmIds.length / allResolvedIds.size : 1;

  if (newRatio >= 0.3 && allResolvedIds.size >= 5) {
    // Prune SeenUser entries where this user was the one seen,
    // giving others a chance to rediscover them
    await prisma.seenUser.deleteMany({
      where: { seenUserId: userId },
    });
  }

  // Update user's letterboxd username
  await prisma.user.update({
    where: { id: userId },
    data: { letterboxdUsername },
  });

  return {
    totalScraped,
    totalResolved,
    totalUnresolved,
    isEligibleForMatching: totalResolved >= 5,
    watchedCount: watchedIds.length,
    ratedCount: ratedFilms.length,
    likedCount: likedIds.length,
  };
}
