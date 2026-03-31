import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('TMDB Service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('TMDB_API_READ_ACCESS_TOKEN', 'test-token-123');
    mockFetch.mockReset();
  });

  describe('resolveTMDBPoster', () => {
    it('returns null when no API token is configured', async () => {
      vi.stubEnv('TMDB_API_READ_ACCESS_TOKEN', '');
      vi.stubEnv('TMDB_API_TOKEN', '');
      const { resolveTMDBPoster } = await import('../tmdb');
      const result = await resolveTMDBPoster('Inception', 2010);
      expect(result).toBeNull();
    });

    it('returns poster URL for a successful search', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          results: [{ poster_path: '/poster123.jpg' }],
        }),
      });

      const { resolveTMDBPoster } = await import('../tmdb');
      const result = await resolveTMDBPoster('Inception', 2010);
      expect(result).toBe('https://image.tmdb.org/t/p/w342/poster123.jpg');
    });

    it('returns null when no results found', async () => {
      // Return empty results for all search variants
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ results: [] }),
      });

      const { resolveTMDBPoster } = await import('../tmdb');
      const result = await resolveTMDBPoster('Nonexistent Film XYZ123', 2099);
      expect(result).toBeNull();
    });

    it('handles 429 rate limit with retry', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          headers: new Map([['Retry-After', '1']]),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            results: [{ poster_path: '/retried.jpg' }],
          }),
        });

      const { resolveTMDBPoster } = await import('../tmdb');
      const result = await resolveTMDBPoster('Retry Film', 2020);
      expect(result).toBe('https://image.tmdb.org/t/p/w342/retried.jpg');
    });
  });

  describe('resolveTMDBPosterById', () => {
    it('returns poster URL for a valid TMDB ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ poster_path: '/byid.jpg' }),
      });

      const { resolveTMDBPosterById } = await import('../tmdb');
      const result = await resolveTMDBPosterById(550);
      expect(result).toBe('https://image.tmdb.org/t/p/w342/byid.jpg');
    });

    it('returns null for a non-existent movie ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const { resolveTMDBPosterById } = await import('../tmdb');
      const result = await resolveTMDBPosterById(999999999);
      expect(result).toBeNull();
    });
  });
});
