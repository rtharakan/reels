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
 * Clean a title for TMDB search: remove problematic punctuation that causes
 * TMDB to return zero results while keeping the essential words.
 */
function cleanTitleForSearch(title: string): string[] {
  const variants: string[] = [title.trim()];

  // Strip content in parentheses (e.g. "Film (2024)" → "Film")
  const noParens = title.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  if (noParens && noParens !== title.trim()) variants.push(noParens);

  // Replace common punctuation with spaces
  const noPunct = title
    .replace(/[''`]/g, '')          // Remove apostrophes/backticks entirely
    .replace(/[:\-–—,;.!?&@#]/g, ' ')  // Replace punctuation with spaces
    .replace(/\s+/g, ' ')
    .trim();
  if (noPunct && !variants.includes(noPunct)) variants.push(noPunct);

  // Just alphanumeric + spaces
  const alphaOnly = title
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (alphaOnly && !variants.includes(alphaOnly)) variants.push(alphaOnly);

  return variants.filter(Boolean);
}

async function tmdbSearch(query: string, year: number | undefined, token: string): Promise<string | null> {
  const params = new URLSearchParams({ query });
  if (year) params.set('primary_release_year', String(year));

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
    if (!retryRes.ok) return null;
    const retryData = await retryRes.json();
    return retryData.results?.[0]?.poster_path
      ? `https://image.tmdb.org/t/p/w342${retryData.results[0].poster_path}`
      : null;
  }

  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0]?.poster_path
    ? `https://image.tmdb.org/t/p/w342${data.results[0].poster_path}`
    : null;
}

/**
 * Resolve a film poster URL from TMDB by title + optional year.
 * Uses an in-memory cache and multi-strategy search to handle punctuation issues.
 */
export async function resolveTMDBPoster(
  title: string,
  year: number | undefined,
): Promise<string | null> {
  const token = getApiToken();
  if (!token) return null;

  const key = cacheKey(title, year);
  if (posterCache.has(key)) return posterCache.get(key) ?? null;

  try {
    // Strategy 1: Try exact title with year
    const variants = cleanTitleForSearch(title);
    for (const variant of variants) {
      const url = await tmdbSearch(variant, year, token);
      if (url) {
        posterCache.set(key, url);
        return url;
      }
    }

    // Strategy 2: Try without year constraint (sometimes years are off by 1)
    if (year) {
      for (const variant of variants) {
        const url = await tmdbSearch(variant, undefined, token);
        if (url) {
          posterCache.set(key, url);
          return url;
        }
      }
    }

    posterCache.set(key, null);
    return null;
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
        // Always prefer TMDB poster URLs — Letterboxd CDN URLs may fail through proxies
        if (film.posterUrl && film.posterUrl.includes('image.tmdb.org')) return film;
        try {
          const tmdbPoster = await resolveTMDBPoster(film.title, film.year);
          return { ...film, posterUrl: tmdbPoster ?? film.posterUrl ?? undefined };
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
 * Returns both English and original titles to enable cross-language matching.
 */
export async function fetchNowPlaying(
  region = 'NL',
  page = 1,
): Promise<{ id: number; title: string; originalTitle: string; posterUrl: string; releaseDate: string; overview: string }[]> {
  const token = getApiToken();
  if (!token) return [];

  try {
    // Fetch in English for display
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
    const films = (data.results ?? [])
      .filter((m: { poster_path?: string }) => m.poster_path)
      .map((m: { id: number; title: string; original_title: string; poster_path: string; release_date: string; overview: string }) => ({
        id: m.id,
        title: m.title,
        originalTitle: m.original_title || m.title,
        posterUrl: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
        releaseDate: m.release_date,
        overview: m.overview,
      }));

    // Also fetch Dutch titles for local cinema matching
    const nlParams = new URLSearchParams({
      region,
      page: String(page),
      language: 'nl-NL',
    });
    try {
      const nlRes = await fetch(`${TMDB_API_BASE}/movie/now_playing?${nlParams}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (nlRes.ok) {
        const nlData = await nlRes.json();
        const nlMap = new Map<number, string>();
        for (const m of nlData.results ?? []) {
          if (m.id && m.title) nlMap.set(m.id, m.title);
        }
        for (const film of films) {
          const nlTitle = nlMap.get(film.id);
          if (nlTitle && nlTitle !== film.title) {
            (film as Record<string, unknown>).dutchTitle = nlTitle;
          }
        }
      }
    } catch {
      // Non-fatal — Dutch titles are a bonus for matching
    }

    return films;
  } catch {
    return [];
  }
}
