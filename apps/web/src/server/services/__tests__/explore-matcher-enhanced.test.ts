import { describe, it, expect } from 'vitest';
import { computeExploreMatch, computeExploreMatchLegacy, type ExploreUserData } from '../explore-matcher';
import type { ExploreFilm } from '../explore-scraper';

function makeFilm(slug: string, title?: string, year?: number): ExploreFilm {
  return {
    letterboxdSlug: slug,
    title: title ?? slug,
    year: year ?? 2020,
    posterUrl: null,
  };
}

describe('computeExploreMatch — enhanced scoring', () => {
  it('returns zero for completely disjoint users', () => {
    const user1: ExploreUserData = {
      watchlist: [makeFilm('a'), makeFilm('b')],
      watched: [],
      liked: [],
      highRated: [],
    };
    const user2: ExploreUserData = {
      watchlist: [makeFilm('c'), makeFilm('d')],
      watched: [],
      liked: [],
      highRated: [],
    };

    const result = computeExploreMatch(user1, user2);
    expect(result.combinedScore).toBe(0);
    expect(result.sharedFilms).toHaveLength(0);
  });

  it('returns non-zero score when there is liked overlap', () => {
    const shared = [makeFilm('a'), makeFilm('b')];
    const user1: ExploreUserData = {
      watchlist: [], watched: [],
      liked: shared, highRated: [],
    };
    const user2: ExploreUserData = {
      watchlist: [], watched: [],
      liked: shared, highRated: [],
    };

    const result = computeExploreMatch(user1, user2);
    expect(result.combinedScore).toBeGreaterThan(0);
    expect(result.likedOverlap).toBe(1);
    expect(result.sharedLikedFilms).toHaveLength(2);
  });

  it('calculates watched overlap correctly', () => {
    const user1: ExploreUserData = {
      watchlist: [], liked: [], highRated: [],
      watched: [makeFilm('a'), makeFilm('b'), makeFilm('c')],
    };
    const user2: ExploreUserData = {
      watchlist: [], liked: [], highRated: [],
      watched: [makeFilm('a'), makeFilm('d')],
    };

    const result = computeExploreMatch(user1, user2);
    expect(result.watchedOverlap).toBeGreaterThan(0);
    expect(result.sharedWatchedFilms).toHaveLength(1);
  });

  it('returns totalUser1 and totalUser2 counts', () => {
    const user1: ExploreUserData = {
      watchlist: [makeFilm('a')], watched: [makeFilm('b')],
      liked: [], highRated: [],
    };
    const user2: ExploreUserData = {
      watchlist: [makeFilm('c')], watched: [makeFilm('d'), makeFilm('e')],
      liked: [], highRated: [],
    };

    const result = computeExploreMatch(user1, user2);
    expect(result.totalUser1).toBe(2);
    expect(result.totalUser2).toBe(3);
  });

  it('deduplicates shared films across signals', () => {
    const film = makeFilm('shared-film');
    const user1: ExploreUserData = {
      watchlist: [film], watched: [film],
      liked: [film], highRated: [film],
    };
    const user2: ExploreUserData = {
      watchlist: [film], watched: [film],
      liked: [film], highRated: [film],
    };

    const result = computeExploreMatch(user1, user2);
    expect(result.sharedFilms).toHaveLength(1);
  });
});

describe('computeExploreMatchLegacy', () => {
  it('works with flat film arrays (backward compat)', () => {
    const films1 = [makeFilm('a'), makeFilm('b')];
    const films2 = [makeFilm('a'), makeFilm('c')];

    const result = computeExploreMatchLegacy(films1, films2);
    expect(result.overlapScore).toBeGreaterThan(0);
    expect(result.sharedFilms.length).toBeGreaterThan(0);
  });
});
