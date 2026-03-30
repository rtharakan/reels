/**
 * TMDB poster resolution service.
 * Shared utility for resolving film poster URLs via The Movie Database API.
 */

const TMDB_API_BASE = 'https://api.themoviedb.org/3';

// In-memory poster cache (process-scoped, survives across requests)
const posterCache = new Map<string, string | null>();

function cacheKey(title: string, year: number | undefined): string {
  return `${title.toLowerCase().trim()}::${year ?? ''}`;
}

function getApiToken(): string | null {
  return process.env.TMDB_API_READ_ACCESS_TOKEN ?? process.env.TMDB_API_TOKEN ?? null;
}

/**
 * Resolve a film poster URL from TMDB by title + optional year.
 * Uses an in-memory cache to avoid redundant API calls.
 */
export async function resolveTMDBPoster(
  title: string,
  year: number | undefined,
): Promise<string | null> {
  const token = getApiToken();
  if (!token) return null;

  const key = cacheKey(title, year);
  if (posterCache.has(key)) return posterCache.get(key) ?? null;

  const params = new URLSearchParams({ query: title });
  if (year) params.set('primary_release_year', String(year));

  try {
    const res = await fetch(`${TMDB_API_BASE}/search/movie?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get('Retry-After') ?? '2', 10);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      const retryRes = await fetch(`${TMDB_API_BASE}/search/movie?${params}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!retryRes.ok) { posterCache.set(key, null); return null; }
      const retryData = await retryRes.json();
      const url = retryData.results?.[0]?.poster_path
        ? `https://image.tmdb.org/t/p/w342${retryData.results[0].poster_path}`
        : null;
      posterCache.set(key, url);
      return url;
    }

    if (!res.ok) { posterCache.set(key, null); return null; }
    const data = await res.json();
    const url = data.results?.[0]?.poster_path
      ? `https://image.tmdb.org/t/p/w342${data.results[0].poster_path}`
      : null;
    posterCache.set(key, url);
    return url;
  } catch {
    posterCache.set(key, null);
    return null;
  }
}

/**
 * Batch-resolve posters for an array of films.
 * Processes in batches of 8 to respect TMDB rate limits (40 req/10s).
 */
export async function enrichFilmsWithPosters<T extends { title: string; year?: number; posterUrl?: string }>(
  films: T[],
): Promise<T[]> {
  const token = getApiToken();
  if (!token) return films;

  const BATCH_SIZE = 8;
  const enriched: T[] = [];

  for (let i = 0; i < films.length; i += BATCH_SIZE) {
    const batch = films.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (film) => {
        if (film.posterUrl && film.posterUrl.includes('image.tmdb.org')) return film;
        try {
          const tmdbPoster = await resolveTMDBPoster(film.title, film.year);
          return { ...film, posterUrl: tmdbPoster ?? film.posterUrl };
        } catch {
          return film;
        }
      }),
    );
    enriched.push(...results);
  }

  return enriched;
}

/**
 * Fetch currently playing films from TMDB for a given region.
 */
export async function fetchNowPlaying(
  region = 'NL',
  page = 1,
): Promise<{ id: number; title: string; posterUrl: string; releaseDate: string; overview: string }[]> {
  const token = getApiToken();
  if (!token) return [];

  try {
    const params = new URLSearchParams({
      region,
      page: String(page),
      language: 'en-US',
    });
    const res = await fetch(`${TMDB_API_BASE}/movie/now_playing?${params}`, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? [])
      .filter((m: { poster_path?: string }) => m.poster_path)
      .map((m: { id: number; title: string; poster_path: string; release_date: string; overview: string }) => ({
        id: m.id,
        title: m.title,
        posterUrl: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
        releaseDate: m.release_date,
        overview: m.overview,
      }));
  } catch {
    return [];
  }
}
