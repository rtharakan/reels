import { describe, it, expect } from 'vitest';
import { computeGenreSimilarity, buildGenreVector } from '../src/genre-similarity';

describe('buildGenreVector', () => {
  it('builds frequency map from genre arrays', () => {
    const vector = buildGenreVector([[18, 80], [18, 53], [80]]);
    expect(vector.get(18)).toBe(2);
    expect(vector.get(80)).toBe(2);
    expect(vector.get(53)).toBe(1);
  });

  it('returns empty map for empty input', () => {
    const vector = buildGenreVector([]);
    expect(vector.size).toBe(0);
  });
});

describe('computeGenreSimilarity', () => {
  it('returns 1 for identical vectors', () => {
    const v = new Map([[18, 3], [80, 2]]);
    expect(computeGenreSimilarity(v, v)).toBeCloseTo(1);
  });

  it('returns 0 for orthogonal vectors', () => {
    const a = new Map([[18, 1]]);
    const b = new Map([[80, 1]]);
    expect(computeGenreSimilarity(a, b)).toBe(0);
  });

  it('returns 0 for empty vectors', () => {
    const empty = new Map<number, number>();
    expect(computeGenreSimilarity(empty, empty)).toBe(0);
  });

  it('computes correct cosine similarity', () => {
    // A = [3, 4, 0], B = [4, 3, 0]
    // dot = 12 + 12 = 24, |A| = 5, |B| = 5 → 24/25 = 0.96
    const a = new Map([[1, 3], [2, 4]]);
    const b = new Map([[1, 4], [2, 3]]);
    expect(computeGenreSimilarity(a, b)).toBeCloseTo(24 / 25);
  });
});
