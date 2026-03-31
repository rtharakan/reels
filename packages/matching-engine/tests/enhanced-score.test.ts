import { describe, it, expect } from 'vitest';
import { computeEnhancedMatchScore } from '../src/score';
import type { EnhancedMatchScoreInput } from '../src/score';

function makeEmptyInput(): EnhancedMatchScoreInput {
  return {
    userAWatchlistIds: [],
    userAWatchlistGenres: [],
    userBWatchlistIds: [],
    userBWatchlistGenres: [],
    userAWatchedIds: [],
    userAWatchedGenres: [],
    userBWatchedIds: [],
    userBWatchedGenres: [],
    userAHighRatedIds: [],
    userAHighRatedGenres: [],
    userBHighRatedIds: [],
    userBHighRatedGenres: [],
    userALikedIds: [],
    userALikedGenres: [],
    userBLikedIds: [],
    userBLikedGenres: [],
  };
}

describe('computeEnhancedMatchScore', () => {
  it('returns zero for completely disjoint users', () => {
    const input = makeEmptyInput();
    input.userAWatchlistIds = ['a', 'b'];
    input.userAWatchlistGenres = [[18], [80]];
    input.userBWatchlistIds = ['c', 'd'];
    input.userBWatchlistGenres = [[28], [878]];

    const result = computeEnhancedMatchScore(input);
    expect(result.totalScore).toBe(0);
    expect(result.sharedFilmIds).toEqual([]);
  });

  it('returns perfect score when all signals are identical', () => {
    const ids = ['a', 'b', 'c'];
    const genres = [[18, 80], [53], [28]];

    const input: EnhancedMatchScoreInput = {
      userAWatchlistIds: ids,
      userAWatchlistGenres: genres,
      userBWatchlistIds: ids,
      userBWatchlistGenres: genres,
      userAWatchedIds: ids,
      userAWatchedGenres: genres,
      userBWatchedIds: ids,
      userBWatchedGenres: genres,
      userAHighRatedIds: ids,
      userAHighRatedGenres: genres,
      userBHighRatedIds: ids,
      userBHighRatedGenres: genres,
      userALikedIds: ids,
      userALikedGenres: genres,
      userBLikedIds: ids,
      userBLikedGenres: genres,
    };

    const result = computeEnhancedMatchScore(input);
    expect(result.totalScore).toBeCloseTo(1);
    expect(result.likedOverlap).toBe(1);
    expect(result.ratedOverlap).toBe(1);
    expect(result.watchedOverlap).toBe(1);
    expect(result.watchlistOverlap).toBe(1);
    expect(result.genreSimilarity).toBeCloseTo(1);
  });

  it('weights liked overlap at 30%', () => {
    const input = makeEmptyInput();
    // Only liked films overlap — everything else empty
    input.userALikedIds = ['a', 'b', 'c'];
    input.userALikedGenres = [[18], [80], [53]];
    input.userBLikedIds = ['a', 'b', 'c'];
    input.userBLikedGenres = [[18], [80], [53]];

    const result = computeEnhancedMatchScore(input);
    // liked overlap = 1.0, genre similarity = 1.0 (same liked films)
    // raw score = 0.30 × 1.0 + 0.20 × 1.0 = 0.50
    // active signals: liked (both >0) + genres (both >0) = 2 → confidence 0.8
    // total = 0.50 × 0.8 = 0.40
    expect(result.likedOverlap).toBe(1);
    expect(result.totalScore).toBeCloseTo(0.40);
  });

  it('weights rated overlap at 25%', () => {
    const input = makeEmptyInput();
    input.userAHighRatedIds = ['a', 'b'];
    input.userAHighRatedGenres = [[18], [80]];
    input.userBHighRatedIds = ['a', 'b'];
    input.userBHighRatedGenres = [[18], [80]];

    const result = computeEnhancedMatchScore(input);
    // rated overlap = 1.0, genre similarity = 1.0
    // raw score = 0.25 × 1.0 + 0.20 × 1.0 = 0.45
    // active signals: rated (both >0) + genres (both >0) = 2 → confidence 0.8
    // total = 0.45 × 0.8 = 0.36
    expect(result.ratedOverlap).toBe(1);
    expect(result.totalScore).toBeCloseTo(0.36);
  });

  it('weights watched overlap at 15%', () => {
    const input = makeEmptyInput();
    input.userAWatchedIds = ['a', 'b'];
    input.userAWatchedGenres = [[18], [80]];
    input.userBWatchedIds = ['a', 'b'];
    input.userBWatchedGenres = [[18], [80]];

    const result = computeEnhancedMatchScore(input);
    // watched overlap = 1.0, genre similarity = 1.0
    // raw score = 0.15 × 1.0 + 0.20 × 1.0 = 0.35
    // active signals: watched (both >0) + genres (both >0) = 2 → confidence 0.8
    // total = 0.35 × 0.8 = 0.28
    expect(result.watchedOverlap).toBe(1);
    expect(result.totalScore).toBeCloseTo(0.28);
  });

  it('weights watchlist overlap at 10%', () => {
    const input = makeEmptyInput();
    input.userAWatchlistIds = ['a', 'b'];
    input.userAWatchlistGenres = [[18], [80]];
    input.userBWatchlistIds = ['a', 'b'];
    input.userBWatchlistGenres = [[18], [80]];

    const result = computeEnhancedMatchScore(input);
    // watchlist overlap = 1.0, genre similarity = 1.0
    // raw score = 0.10 × 1.0 + 0.20 × 1.0 = 0.30
    // active signals: watchlist (both >0) + genres (both >0) = 2 → confidence 0.8
    // total = 0.30 × 0.8 = 0.24
    expect(result.watchlistOverlap).toBe(1);
    expect(result.totalScore).toBeCloseTo(0.24);
  });

  it('gives more weight to likes + ratings than watchlist alone', () => {
    const input = makeEmptyInput();
    // User pair A: only watchlist overlap
    const inputWatchlistOnly = makeEmptyInput();
    inputWatchlistOnly.userAWatchlistIds = ['a', 'b', 'c'];
    inputWatchlistOnly.userAWatchlistGenres = [[18], [80], [53]];
    inputWatchlistOnly.userBWatchlistIds = ['a', 'b', 'c'];
    inputWatchlistOnly.userBWatchlistGenres = [[18], [80], [53]];

    // User pair B: likes + ratings overlap (same films)
    const inputLikesRated = makeEmptyInput();
    inputLikesRated.userALikedIds = ['a', 'b', 'c'];
    inputLikesRated.userALikedGenres = [[18], [80], [53]];
    inputLikesRated.userBLikedIds = ['a', 'b', 'c'];
    inputLikesRated.userBLikedGenres = [[18], [80], [53]];
    inputLikesRated.userAHighRatedIds = ['a', 'b', 'c'];
    inputLikesRated.userAHighRatedGenres = [[18], [80], [53]];
    inputLikesRated.userBHighRatedIds = ['a', 'b', 'c'];
    inputLikesRated.userBHighRatedGenres = [[18], [80], [53]];

    const watchlistScore = computeEnhancedMatchScore(inputWatchlistOnly);
    const likesRatedScore = computeEnhancedMatchScore(inputLikesRated);

    // Likes + ratings should produce a significantly higher score
    expect(likesRatedScore.totalScore).toBeGreaterThan(watchlistScore.totalScore);
  });

  it('deduplicates shared film IDs across signals', () => {
    const input = makeEmptyInput();
    // Film 'a' appears in liked, rated, AND watchlist
    input.userALikedIds = ['a'];
    input.userALikedGenres = [[18]];
    input.userBLikedIds = ['a'];
    input.userBLikedGenres = [[18]];
    input.userAHighRatedIds = ['a'];
    input.userAHighRatedGenres = [[18]];
    input.userBHighRatedIds = ['a'];
    input.userBHighRatedGenres = [[18]];
    input.userAWatchlistIds = ['a'];
    input.userAWatchlistGenres = [[18]];
    input.userBWatchlistIds = ['a'];
    input.userBWatchlistGenres = [[18]];

    const result = computeEnhancedMatchScore(input);
    // Should only appear once in sharedFilmIds
    expect(result.sharedFilmIds).toEqual(['a']);
  });

  it('handles empty inputs gracefully', () => {
    const input = makeEmptyInput();
    const result = computeEnhancedMatchScore(input);
    expect(result.totalScore).toBe(0);
    expect(result.sharedFilmIds).toEqual([]);
    expect(result.sharedLikedIds).toEqual([]);
    expect(result.sharedRatedIds).toEqual([]);
    expect(result.sharedWatchedIds).toEqual([]);
    expect(result.sharedWatchlistIds).toEqual([]);
  });

  it('computes genre similarity across all combined sources', () => {
    const input = makeEmptyInput();
    // User A: likes drama, watches action
    input.userALikedGenres = [[18]]; // Drama
    input.userALikedIds = ['x'];
    input.userAWatchedGenres = [[28]]; // Action
    input.userAWatchedIds = ['y'];
    // User B: likes drama, watches action (same taste pattern)
    input.userBLikedGenres = [[18]];
    input.userBLikedIds = ['z'];
    input.userBWatchedGenres = [[28]];
    input.userBWatchedIds = ['w'];

    const result = computeEnhancedMatchScore(input);
    // No film overlap, but identical genre profile → genreSimilarity = 1.0
    // raw score = 0.20 × 1.0 = 0.20
    // active signals: liked (both >0) + watched (both >0) + genres (both >0) = 3 → confidence 0.9
    // total = 0.20 × 0.9 = 0.18
    expect(result.genreSimilarity).toBeCloseTo(1);
    expect(result.totalScore).toBeCloseTo(0.18);
  });

  it('produces correct sum of weighted components', () => {
    const input: EnhancedMatchScoreInput = {
      userALikedIds: ['a', 'b', 'c', 'd'],
      userALikedGenres: [[18], [80], [53], [28]],
      userBLikedIds: ['c', 'd', 'e', 'f'],
      userBLikedGenres: [[53], [28], [18], [80]],
      userAHighRatedIds: ['a', 'b'],
      userAHighRatedGenres: [[18], [80]],
      userBHighRatedIds: ['b', 'c'],
      userBHighRatedGenres: [[80], [53]],
      userAWatchedIds: ['a', 'b', 'c'],
      userAWatchedGenres: [[18], [80], [53]],
      userBWatchedIds: ['a', 'b', 'c'],
      userBWatchedGenres: [[18], [80], [53]],
      userAWatchlistIds: ['x', 'y'],
      userAWatchlistGenres: [[18], [28]],
      userBWatchlistIds: ['y', 'z'],
      userBWatchlistGenres: [[28], [53]],
    };

    const result = computeEnhancedMatchScore(input);

    const expected =
      0.30 * result.likedOverlap +
      0.25 * result.ratedOverlap +
      0.15 * result.watchedOverlap +
      0.10 * result.watchlistOverlap +
      0.20 * result.genreSimilarity;

    expect(result.totalScore).toBeCloseTo(expected);
  });
});
