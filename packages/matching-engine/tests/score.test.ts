import { describe, it, expect } from 'vitest';
import { computeMatchScore } from '../src/score';

describe('computeMatchScore', () => {
  it('returns zero scores for no overlap', () => {
    const result = computeMatchScore({
      userAFilmIds: ['a', 'b'],
      userAGenres: [[18], [80]],
      userBFilmIds: ['c', 'd'],
      userBGenres: [[28], [878]],
    });
    expect(result.filmOverlap).toBe(0);
    expect(result.sharedFilmIds).toEqual([]);
    // Genre similarity is 0 since genres are completely different
    expect(result.totalScore).toBe(0);
  });

  it('returns perfect scores for identical watchlists', () => {
    const result = computeMatchScore({
      userAFilmIds: ['a', 'b', 'c'],
      userAGenres: [[18, 80], [53], [28]],
      userBFilmIds: ['a', 'b', 'c'],
      userBGenres: [[18, 80], [53], [28]],
    });
    expect(result.filmOverlap).toBe(1);
    expect(result.genreSimilarity).toBeCloseTo(1);
    expect(result.totalScore).toBeCloseTo(1);
    expect(result.sharedFilmIds.sort()).toEqual(['a', 'b', 'c']);
  });

  it('uses 70/30 weighting for film overlap vs genre similarity', () => {
    // 50% film overlap, genres partially overlap
    const result = computeMatchScore({
      userAFilmIds: ['a', 'b', 'c', 'd'],
      userAGenres: [[18], [80], [53], [28]],
      userBFilmIds: ['c', 'd', 'e', 'f'],
      userBGenres: [[53], [28], [18], [80]],
    });

    // Film overlap: 2/6 = 0.333
    expect(result.filmOverlap).toBeCloseTo(2 / 6);

    // Total = 0.7 * filmOverlap + 0.3 * genreSimilarity
    const expected = 0.7 * result.filmOverlap + 0.3 * result.genreSimilarity;
    expect(result.totalScore).toBeCloseTo(expected);
    expect(result.sharedFilmIds.sort()).toEqual(['c', 'd']);
  });

  it('handles empty watchlists', () => {
    const result = computeMatchScore({
      userAFilmIds: [],
      userAGenres: [],
      userBFilmIds: [],
      userBGenres: [],
    });
    expect(result.totalScore).toBe(0);
    expect(result.sharedFilmIds).toEqual([]);
  });
});
