export type TMDBSearchResult = {
  tmdbId: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  genreIds: number[];
};

export type NormalizationResult = {
  resolved: TMDBSearchResult | null;
  originalTitle: string;
};

const TMDB_API_BASE = 'https://api.themoviedb.org/3';

const MAX_RETRIES = 3;

async function searchTMDB(
  title: string,
  year: number | null,
  apiToken: string,
  retryCount = 0,
): Promise<TMDBSearchResult | null> {
  const params = new URLSearchParams({ query: title });
  if (year) params.set('primary_release_year', String(year));

  const url = `${TMDB_API_BASE}/search/movie?${params}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 429) {
    if (retryCount >= MAX_RETRIES) return null;
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '2', 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    return searchTMDB(title, year, apiToken, retryCount + 1);
  }

  if (!res.ok) return null;

  const data = await res.json();
  const results = data.results;
  if (!results || results.length === 0) {
    // Retry without year
    if (year) return searchTMDB(title, null, apiToken, retryCount);
    // Retry with cleaned title (remove punctuation that TMDB can't handle)
    const cleaned = title
      .replace(/['''`\u201C\u201D\u201E]/g, '')
      .replace(/[:\-–—,;.!?&@#\/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned !== title) return searchTMDB(cleaned, null, apiToken, retryCount);
    return null;
  }

  const movie = results[0];
  const releaseYear = movie.release_date ? parseInt(movie.release_date.substring(0, 4), 10) : null;

  return {
    tmdbId: movie.id,
    title: movie.title,
    year: releaseYear,
    posterPath: movie.poster_path ?? null,
    genreIds: movie.genre_ids ?? [],
  };
}

export async function normalizeFilms(
  films: { title: string; slug: string }[],
  apiToken: string,
): Promise<NormalizationResult[]> {
  const results: NormalizationResult[] = [];

  for (const film of films) {
    // Extract year from slug if possible (e.g., "the-matrix-1999")
    const yearMatch = film.slug.match(/-(\d{4})$/);
    const year = yearMatch?.[1] ? parseInt(yearMatch[1], 10) : null;

    try {
      const resolved = await searchTMDB(film.title, year, apiToken);
      results.push({ resolved, originalTitle: film.title });
    } catch {
      results.push({ resolved: null, originalTitle: film.title });
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}
