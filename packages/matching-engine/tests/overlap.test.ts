import { describe, it, expect } from 'vitest';
import { computeFilmOverlap } from '../src/overlap';

describe('computeFilmOverlap', () => {
  it('returns 0 for no overlap', () => {
    const result = computeFilmOverlap(['a', 'b', 'c'], ['d', 'e', 'f']);
    expect(result.score).toBe(0);
    expect(result.sharedFilmIds).toEqual([]);
  });

  it('returns 1 for identical sets', () => {
    const result = computeFilmOverlap(['a', 'b', 'c'], ['a', 'b', 'c']);
    expect(result.score).toBe(1);
    expect(result.sharedFilmIds).toEqual(['a', 'b', 'c']);
  });

  it('returns correct Jaccard similarity for partial overlap', () => {
    const result = computeFilmOverlap(['a', 'b', 'c', 'd'], ['b', 'c', 'd', 'e']);
    // intersection = {b, c, d} = 3, union = {a, b, c, d, e} = 5
    expect(result.score).toBeCloseTo(3 / 5);
    expect(result.sharedFilmIds.sort()).toEqual(['b', 'c', 'd']);
  });

  it('handles empty arrays', () => {
    const result = computeFilmOverlap([], []);
    expect(result.score).toBe(0);
    expect(result.sharedFilmIds).toEqual([]);
  });

  it('handles one empty array', () => {
    const result = computeFilmOverlap(['a', 'b'], []);
    expect(result.score).toBe(0);
    expect(result.sharedFilmIds).toEqual([]);
  });
});
