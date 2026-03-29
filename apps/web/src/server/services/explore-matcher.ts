/**
 * Explore matching engine.
 * Compares two Letterboxd watchlists and produces a compatibility score
 * using the same algorithm as the main matching engine.
 */

import type { ExploreFilm } from './explore-scraper';

export interface ExploreMatchResult {
  overlapScore: number;
  genreScore: number;
  combinedScore: number;
  sharedFilms: ExploreFilm[];
  user1Only: ExploreFilm[];
  user2Only: ExploreFilm[];
  totalUser1: number;
  totalUser2: number;
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

export function computeExploreMatch(
  films1: ExploreFilm[],
  films2: ExploreFilm[]
): ExploreMatchResult {
  const { score: overlapScore, shared, only1, only2 } = filmOverlap(films1, films2);

  // Genre similarity placeholder (we don't have genre data from raw scrape,
  // so we use a title-diversity heuristic based on overlap ratio)
  const genreScore = overlapScore > 0 ? Math.min(1, overlapScore * 1.5) : 0;

  // Combined: 70% film overlap + 30% genre similarity (mirrors matching-engine)
  const combinedScore = 0.7 * overlapScore + 0.3 * genreScore;

  return {
    overlapScore: Math.round(overlapScore * 100) / 100,
    genreScore: Math.round(genreScore * 100) / 100,
    combinedScore: Math.round(combinedScore * 100) / 100,
    sharedFilms: shared,
    user1Only: only1,
    user2Only: only2,
    totalUser1: films1.length,
    totalUser2: films2.length,
  };
}
