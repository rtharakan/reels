import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NormalizationResult } from '../src/normalizer';

// We test the normalizeFilms function by mocking the global fetch
describe('normalizeFilms', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes films by searching TMDB API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        results: [{
          id: 680,
          title: 'Pulp Fiction',
          release_date: '1994-10-14',
          poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
          genre_ids: [53, 80],
        }],
      }),
    }));

    const { normalizeFilms } = await import('../src/normalizer');
    const results = await normalizeFilms(
      [{ title: 'Pulp Fiction', slug: 'pulp-fiction-1994' }],
      'fake-token',
    );

    expect(results).toHaveLength(1);
    expect(results[0]!.resolved).toBeTruthy();
    expect(results[0]!.resolved!.tmdbId).toBe(680);
    expect(results[0]!.resolved!.title).toBe('Pulp Fiction');
    expect(results[0]!.resolved!.year).toBe(1994);
  });

  it('handles TMDB returning no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ results: [] }),
    }));

    const { normalizeFilms } = await import('../src/normalizer');
    const results = await normalizeFilms(
      [{ title: 'Unknown Film XYZ', slug: 'unknown-film-xyz' }],
      'fake-token',
    );

    expect(results).toHaveLength(1);
    expect(results[0]!.resolved).toBeNull();
  });
});
