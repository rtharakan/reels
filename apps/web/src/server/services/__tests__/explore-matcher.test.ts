import { describe, it, expect } from 'vitest';
import { computeExploreMatch } from '../explore-matcher';
import type { ExploreFilm } from '../explore-scraper';

function makeFilm(slug: string, title?: string): ExploreFilm {
  return {
    letterboxdSlug: slug,
    title: title ?? slug.replace(/-/g, ' '),
    letterboxdUrl: `https://letterboxd.com/film/${slug}/`,
  };
}

describe('computeExploreMatch', () => {
  it('returns zero scores for disjoint watchlists', () => {
    const films1 = [makeFilm('the-matrix'), makeFilm('inception')];
    const films2 = [makeFilm('parasite'), makeFilm('moonlight')];
    const result = computeExploreMatch(films1, films2);

    expect(result.overlapScore).toBe(0);
    expect(result.genreScore).toBe(0);
    expect(result.combinedScore).toBe(0);
    expect(result.sharedFilms).toHaveLength(0);
    expect(result.user1Only).toHaveLength(2);
    expect(result.user2Only).toHaveLength(2);
  });

  it('returns perfect scores for identical watchlists', () => {
    const films = [makeFilm('the-matrix'), makeFilm('inception')];
    const result = computeExploreMatch(films, films);

    expect(result.overlapScore).toBe(1);
    expect(result.combinedScore).toBeGreaterThan(0.9);
    expect(result.sharedFilms).toHaveLength(2);
    expect(result.user1Only).toHaveLength(0);
    expect(result.user2Only).toHaveLength(0);
  });

  it('finds shared films between partially overlapping lists', () => {
    const films1 = [makeFilm('the-matrix'), makeFilm('inception'), makeFilm('parasite')];
    const films2 = [makeFilm('inception'), makeFilm('parasite'), makeFilm('moonlight')];
    const result = computeExploreMatch(films1, films2);

    expect(result.sharedFilms).toHaveLength(2);
    expect(result.sharedFilms.map((f) => f.letterboxdSlug).sort()).toEqual(['inception', 'parasite']);
    expect(result.overlapScore).toBeGreaterThan(0);
    expect(result.overlapScore).toBeLessThan(1);
  });

  it('handles empty watchlists gracefully', () => {
    const result = computeExploreMatch([], []);
    expect(result.overlapScore).toBe(0);
    expect(result.combinedScore).toBe(0);
    expect(result.sharedFilms).toHaveLength(0);
  });

  it('handles one empty watchlist', () => {
    const films = [makeFilm('the-matrix')];
    const result = computeExploreMatch(films, []);
    expect(result.overlapScore).toBe(0);
    expect(result.user1Only).toHaveLength(1);
    expect(result.user2Only).toHaveLength(0);
  });

  it('computes correct Jaccard coefficient', () => {
    // 2 shared, 3 only-user1, 1 only-user2 => union = 6, Jaccard = 2/6 ≈ 0.33
    const films1 = [makeFilm('a'), makeFilm('b'), makeFilm('c'), makeFilm('d'), makeFilm('e')];
    const films2 = [makeFilm('d'), makeFilm('e'), makeFilm('f')];
    const result = computeExploreMatch(films1, films2);

    expect(result.overlapScore).toBeCloseTo(2 / 6, 2);
    expect(result.sharedFilms).toHaveLength(2);
    expect(result.totalUser1).toBe(5);
    expect(result.totalUser2).toBe(3);
  });

  it('combined score uses 70/30 weighting', () => {
    const films = [makeFilm('a')];
    const result = computeExploreMatch(films, films);
    // overlapScore = 1.0, genreScore = min(1, 1.5) = 1.0
    // combined = 0.7 * 1.0 + 0.3 * 1.0 = 1.0
    expect(result.combinedScore).toBe(1);
  });
});
