import { describe, it, expect } from 'vitest';
import { computeExploreMatch, computeExploreMatchLegacy } from '../explore-matcher';
import type { ExploreFilm } from '../explore-scraper';
import type { ExploreUserData } from '../explore-matcher';

function makeFilm(slug: string, title?: string): ExploreFilm {
  return {
    letterboxdSlug: slug,
    title: title ?? slug.replace(/-/g, ' '),
    letterboxdUrl: `https://letterboxd.com/film/${slug}/`,
  };
}

function makeUser(opts: Partial<ExploreUserData> & { watchlist: ExploreFilm[] }): ExploreUserData {
  return {
    watched: [],
    liked: [],
    highRated: [],
    ...opts,
  };
}

describe('computeExploreMatch', () => {
  it('returns zero scores for disjoint watchlists', () => {
    const user1 = makeUser({ watchlist: [makeFilm('the-matrix'), makeFilm('inception')] });
    const user2 = makeUser({ watchlist: [makeFilm('parasite'), makeFilm('moonlight')] });
    const result = computeExploreMatch(user1, user2);

    expect(result.overlapScore).toBe(0);
    expect(result.genreScore).toBe(0);
    expect(result.combinedScore).toBe(0);
    expect(result.sharedFilms).toHaveLength(0);
    expect(result.user1Only).toHaveLength(2);
    expect(result.user2Only).toHaveLength(2);
  });

  it('returns perfect scores for identical watchlists', () => {
    const films = [makeFilm('the-matrix'), makeFilm('inception')];
    const user = makeUser({ watchlist: films });
    const result = computeExploreMatch(user, user);

    expect(result.watchlistOverlap).toBe(1);
    expect(result.combinedScore).toBeGreaterThan(0);
    expect(result.sharedFilms).toHaveLength(2);
    expect(result.user1Only).toHaveLength(0);
    expect(result.user2Only).toHaveLength(0);
  });

  it('finds shared films between partially overlapping lists', () => {
    const user1 = makeUser({ watchlist: [makeFilm('the-matrix'), makeFilm('inception'), makeFilm('parasite')] });
    const user2 = makeUser({ watchlist: [makeFilm('inception'), makeFilm('parasite'), makeFilm('moonlight')] });
    const result = computeExploreMatch(user1, user2);

    expect(result.sharedFilms).toHaveLength(2);
    expect(result.sharedFilms.map((f) => f.letterboxdSlug).sort()).toEqual(['inception', 'parasite']);
    expect(result.watchlistOverlap).toBeGreaterThan(0);
    expect(result.watchlistOverlap).toBeLessThan(1);
  });

  it('handles empty watchlists gracefully', () => {
    const result = computeExploreMatch(
      makeUser({ watchlist: [] }),
      makeUser({ watchlist: [] }),
    );
    expect(result.watchlistOverlap).toBe(0);
    expect(result.combinedScore).toBe(0);
    expect(result.sharedFilms).toHaveLength(0);
  });

  it('handles one empty watchlist', () => {
    const result = computeExploreMatch(
      makeUser({ watchlist: [makeFilm('the-matrix')] }),
      makeUser({ watchlist: [] }),
    );
    expect(result.watchlistOverlap).toBe(0);
    expect(result.user1Only).toHaveLength(1);
    expect(result.user2Only).toHaveLength(0);
  });

  it('computes correct Jaccard coefficient for watchlist', () => {
    // 2 shared, 3 only-user1, 1 only-user2 => union = 6, Jaccard = 2/6 ≈ 0.33
    const user1 = makeUser({ watchlist: [makeFilm('a'), makeFilm('b'), makeFilm('c'), makeFilm('d'), makeFilm('e')] });
    const user2 = makeUser({ watchlist: [makeFilm('d'), makeFilm('e'), makeFilm('f')] });
    const result = computeExploreMatch(user1, user2);

    expect(result.watchlistOverlap).toBeCloseTo(2 / 6, 2);
    expect(result.sharedFilms).toHaveLength(2);
    expect(result.totalUser1).toBe(5);
    expect(result.totalUser2).toBe(3);
  });

  it('weights liked films at 30%', () => {
    const liked = [makeFilm('a')];
    const result = computeExploreMatch(
      makeUser({ watchlist: [], liked, highRated: [] }),
      makeUser({ watchlist: [], liked, highRated: [] }),
    );
    // liked overlap = 1.0, genre ≈ 1.0 (1 * 1.5 capped at 1)
    // combined = 0.30 * 1.0 + 0.20 * genre
    expect(result.likedOverlap).toBe(1);
    expect(result.combinedScore).toBeGreaterThanOrEqual(0.3);
  });

  it('enhanced scoring uses all 5 signals', () => {
    const shared = [makeFilm('a'), makeFilm('b')];
    const user = makeUser({
      watchlist: shared,
      watched: shared,
      liked: shared,
      highRated: shared,
    });
    const result = computeExploreMatch(user, user);

    expect(result.likedOverlap).toBe(1);
    expect(result.ratedOverlap).toBe(1);
    expect(result.watchedOverlap).toBe(1);
    expect(result.watchlistOverlap).toBe(1);
    expect(result.combinedScore).toBeGreaterThan(0.9);
  });

  it('sharedLikedFilms and sharedWatchedFilms track correctly', () => {
    const liked = [makeFilm('x'), makeFilm('y')];
    const watched = [makeFilm('y'), makeFilm('z')];
    const result = computeExploreMatch(
      makeUser({ watchlist: [], liked, watched }),
      makeUser({ watchlist: [], liked: [makeFilm('x')], watched: [makeFilm('z')] }),
    );

    expect(result.sharedLikedFilms).toHaveLength(1);
    expect(result.sharedLikedFilms[0]!.letterboxdSlug).toBe('x');
    expect(result.sharedWatchedFilms).toHaveLength(1);
    expect(result.sharedWatchedFilms[0]!.letterboxdSlug).toBe('z');
  });
});

describe('computeExploreMatchLegacy', () => {
  it('provides backward-compatible wrapper', () => {
    const films = [makeFilm('a'), makeFilm('b')];
    const result = computeExploreMatchLegacy(films, films);
    expect(result.watchlistOverlap).toBe(1);
    expect(result.sharedFilms).toHaveLength(2);
  });
});
