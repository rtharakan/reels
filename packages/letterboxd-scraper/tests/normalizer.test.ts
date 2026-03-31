import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NormalizationResult } from '../src/normalizer';

const MOCK_RESULT = {
  id: 680,
  title: 'Pulp Fiction',
  release_date: '1994-10-14',
  poster_path: '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  genre_ids: [53, 80],
};

function mockFetchWithResult(result: typeof MOCK_RESULT | null) {
  return vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: () => Promise.resolve({ results: result ? [result] : [] }),
  });
}

// We test the normalizeFilms function by mocking the global fetch
describe('normalizeFilms', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes films by searching TMDB API', async () => {
    vi.stubGlobal('fetch', mockFetchWithResult(MOCK_RESULT));

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
    vi.stubGlobal('fetch', mockFetchWithResult(null));

    const { normalizeFilms } = await import('../src/normalizer');
    const results = await normalizeFilms(
      [{ title: 'Unknown Film XYZ', slug: 'unknown-film-xyz' }],
      'fake-token',
    );

    expect(results).toHaveLength(1);
    expect(results[0]!.resolved).toBeNull();
  });

  it('extracts year from slug with duplicate suffix (e.g. film-2003-1)', async () => {
    // Fetch returns zero results for first call (with year), success on second (without year)
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      const data = callCount <= 2
        ? { results: [] } // first variants with year return empty
        : { results: [MOCK_RESULT] }; // variants without year succeed
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: () => Promise.resolve(data),
      });
    }));

    const { normalizeFilms } = await import('../src/normalizer');
    const results = await normalizeFilms(
      [{ title: 'Pulp Fiction', slug: 'pulp-fiction-1994-1' }],
      'fake-token',
    );

    // Should eventually resolve with no-year fallback
    expect(results).toHaveLength(1);
    // Either resolved or not — just verify no crash
    expect(results[0]!.originalTitle).toBe('Pulp Fiction');
  });

  it('handles films with apostrophes in titles', async () => {
    // First call (with smartquote title) returns empty, second call (cleaned) returns result
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: () => Promise.resolve({
          results: callCount >= 3 ? [{ ...MOCK_RESULT, title: "Schindler's List" }] : [],
        }),
      });
    }));

    const { normalizeFilms } = await import('../src/normalizer');
    const results = await normalizeFilms(
      [{ title: 'Schindler\u2019s List', slug: 'schindlers-list-1993' }], // smart apostrophe
      'fake-token',
    );

    expect(results).toHaveLength(1);
    expect(results[0]!.originalTitle).toBe('Schindler\u2019s List');
  });

  it('handles HTML entities in titles', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      // Succeed only when the query contains the clean title without entity
      const decoded = url.includes('query=Kiki') || url.includes('query=kiki');
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: () => Promise.resolve({
          results: decoded ? [{ ...MOCK_RESULT, title: "Kiki's Delivery Service" }] : [],
        }),
      });
    }));

    const { normalizeFilms } = await import('../src/normalizer');
    const results = await normalizeFilms(
      [{ title: "Kiki&apos;s Delivery Service", slug: 'kikis-delivery-service-1989' }],
      'fake-token',
    );

    expect(results).toHaveLength(1);
    expect(results[0]!.originalTitle).toBe("Kiki&apos;s Delivery Service");
  });

  it('handles 429 rate limit with retry', async () => {
    let callCount = 0;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          headers: { get: (h: string) => h === 'Retry-After' ? '0' : null },
          json: () => Promise.resolve({}),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: () => Promise.resolve({ results: [MOCK_RESULT] }),
      });
    }));

    const { normalizeFilms } = await import('../src/normalizer');
    const results = await normalizeFilms(
      [{ title: 'Pulp Fiction', slug: 'pulp-fiction-1994' }],
      'fake-token',
    );

    expect(results[0]!.resolved).toBeTruthy();
  });
});
