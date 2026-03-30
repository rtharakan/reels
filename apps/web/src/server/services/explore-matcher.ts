/**
 * Explore matching engine.
 * Compares two Letterboxd profiles (watchlist, watched, likes, ratings)
 * using the same 5-signal enhanced algorithm as the main matching engine.
 */

import type { ExploreFilm } from './explore-scraper';

export interface ExploreMatchResult {
  overlapScore: number;
  genreScore: number;
  combinedScore: number;
  likedOverlap: number;
  ratedOverlap: number;
  watchedOverlap: number;
  watchlistOverlap: number;
  sharedFilms: ExploreFilm[];
  sharedLikedFilms: ExploreFilm[];
  sharedWatchedFilms: ExploreFilm[];
  user1Only: ExploreFilm[];
  user2Only: ExploreFilm[];
  totalUser1: number;
  totalUser2: number;
}

export interface ExploreUserData {
  watchlist: ExploreFilm[];
  watched: ExploreFilm[];
  liked: ExploreFilm[];
  highRated: ExploreFilm[];
}

/**
 * Compute Jaccard overlap of two film sets by slug.
 */
function filmOverlap(
  films1: ExploreFilm[],
  films2: ExploreFilm[]
): { score: number; shared: ExploreFilm[]; only1: ExploreFilm[]; only2: ExploreFilm[] } {
  const set1 = new Map(films1.map((f) => [f.letterboxdSlug, f]));
  const set2 = new Map(films2.map((f) => [f.letterboxdSlug, f]));

  const shared: ExploreFilm[] = [];
  const only1: ExploreFilm[] = [];
  const only2: ExploreFilm[] = [];

  for (const [slug, film] of set1) {
    if (set2.has(slug)) {
      shared.push(film);
    } else {
      only1.push(film);
    }
  }

  for (const [slug, film] of set2) {
    if (!set1.has(slug)) {
      only2.push(film);
    }
  }

  const union = set1.size + set2.size - shared.length;
  const score = union === 0 ? 0 : shared.length / union;

  return { score, shared, only1, only2 };
}

/* Enhanced weights — same as packages/matching-engine */
const LIKED_WEIGHT = 0.30;
const RATED_WEIGHT = 0.25;
const GENRE_WEIGHT = 0.20;
const WATCHED_WEIGHT = 0.15;
const WATCHLIST_WEIGHT = 0.10;

/**
 * Enhanced Explore scoring using all available Letterboxd signals.
 * Falls back gracefully when signals are missing.
 */
export function computeExploreMatch(
  user1: ExploreUserData,
  user2: ExploreUserData,
): ExploreMatchResult {
  const liked = filmOverlap(user1.liked, user2.liked);
  const watched = filmOverlap(user1.watched, user2.watched);
  const watchlist = filmOverlap(user1.watchlist, user2.watchlist);

  // High-rated overlap
  const rated = filmOverlap(user1.highRated, user2.highRated);

  // Genre similarity placeholder — we approximate with cross-source overlap ratio
  const allFilms1 = [...user1.liked, ...user1.watched, ...user1.watchlist];
  const allFilms2 = [...user2.liked, ...user2.watched, ...user2.watchlist];
  const allOverlap = filmOverlap(allFilms1, allFilms2);
  const genreScore = allOverlap.score > 0 ? Math.min(1, allOverlap.score * 1.5) : 0;

  const combinedScore =
    LIKED_WEIGHT * liked.score +
    RATED_WEIGHT * rated.score +
    GENRE_WEIGHT * genreScore +
    WATCHED_WEIGHT * watched.score +
    WATCHLIST_WEIGHT * watchlist.score;

  // Deduplicate all shared films
  const allSharedMap = new Map<string, ExploreFilm>();
  for (const f of [...liked.shared, ...rated.shared, ...watched.shared, ...watchlist.shared]) {
    allSharedMap.set(f.letterboxdSlug, f);
  }

  return {
    overlapScore: Math.round(watchlist.score * 100) / 100,
    genreScore: Math.round(genreScore * 100) / 100,
    combinedScore: Math.round(combinedScore * 100) / 100,
    likedOverlap: Math.round(liked.score * 100) / 100,
    ratedOverlap: Math.round(rated.score * 100) / 100,
    watchedOverlap: Math.round(watched.score * 100) / 100,
    watchlistOverlap: Math.round(watchlist.score * 100) / 100,
    sharedFilms: [...allSharedMap.values()],
    sharedLikedFilms: liked.shared,
    sharedWatchedFilms: watched.shared,
    user1Only: watchlist.only1,
    user2Only: watchlist.only2,
    totalUser1: user1.watchlist.length + user1.watched.length,
    totalUser2: user2.watchlist.length + user2.watched.length,
  };
}

/**
 * Legacy wrapper for backward compatibility with tests.
 */
export function computeExploreMatchLegacy(
  films1: ExploreFilm[],
  films2: ExploreFilm[],
): ExploreMatchResult {
  return computeExploreMatch(
    { watchlist: films1, watched: [], liked: [], highRated: [] },
    { watchlist: films2, watched: [], liked: [], highRated: [] },
  );
}
