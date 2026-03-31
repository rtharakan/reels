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

/**
 * Produce a ranked list of title variants to try against TMDB.
 * Order matters: most-specific first, broadest last.
 */
function titleVariants(title: string): string[] {
  const seen = new Set<string>();
  const add = (s: string) => { const t = s.trim(); if (t && !seen.has(t)) { seen.add(t); } };

  // 1. Original as-is
  add(title);

  // 2. Decode HTML entities often present in scraped titles
  const decoded = title
    .replace(/&amp;/g, '&')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
  add(decoded);

  // 3. Remove curly/smart quotes and apostrophes → empty string (e.g., "I'm" → "Im")
  const noSmartQuotes = decoded
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035`]/g, '') // curly single quotes
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '') // curly double quotes
    .replace(/'/g, '')                                         // ASCII apostrophe
    .replace(/\s+/g, ' ')
    .trim();
  add(noSmartQuotes);

  // 4. Replace curly apostrophes with ASCII apostrophe (e.g., "It's" stays "It's")
  const normalizedApostrophe = decoded
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  add(normalizedApostrophe);

  // 5. Remove ALL punctuation and replace with spaces
  const noPunct = decoded
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  add(noPunct);

  // 6. Replace specific punctuation that TMDB struggles with
  const partialClean = decoded
    .replace(/[:\-–—]/g, ' ')  // colons, dashes
    .replace(/[,;.!?&@#/\\]/g, ' ') // misc punctuation
    .replace(/['''`\u201C\u201D\u201E]/g, '') // all quote variants → empty
    .replace(/\s+/g, ' ')
    .trim();
  add(partialClean);

  // 7. Alphanumeric only (last resort for very complex titles)
  const alphaOnly = decoded
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  add(alphaOnly);

  return Array.from(seen).filter(Boolean);
}

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
  if (!results || results.length === 0) return null;

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

/**
 * Try multiple title/year combinations against TMDB.
 * Strategy: each variant tried with year first, then without year.
 * Short-circuits on first success.
 */
async function searchTMDBWithFallbacks(
  title: string,
  year: number | null,
  apiToken: string,
): Promise<TMDBSearchResult | null> {
  const variants = titleVariants(title);

  // First pass: try every variant WITH year (when year is known)
  if (year) {
    for (const variant of variants) {
      const result = await searchTMDB(variant, year, apiToken);
      if (result) return result;
    }
    // Also try year +/- 1 for off-by-one situations (festival films, limited releases)
    for (const variant of variants.slice(0, 3)) {
      const r = await searchTMDB(variant, year - 1, apiToken);
      if (r) return r;
      const r2 = await searchTMDB(variant, year + 1, apiToken);
      if (r2) return r2;
    }
  }

  // Second pass: try every variant WITHOUT year constraint
  for (const variant of variants) {
    const result = await searchTMDB(variant, null, apiToken);
    if (result) return result;
  }

  return null;
}

export async function normalizeFilms(
  films: { title: string; slug: string }[],
  apiToken: string,
): Promise<NormalizationResult[]> {
  const results: NormalizationResult[] = [];

  for (const film of films) {
    // Extract year from slug — Letterboxd slugs often end in "-YYYY"
    // Also handle slugs like "the-matrix-reloaded-2003-1" (duplicate suffix)
    const yearMatch = film.slug.match(/-(\d{4})(?:-\d+)?$/);
    const year = yearMatch?.[1] ? parseInt(yearMatch[1], 10) : null;

    try {
      const resolved = await searchTMDBWithFallbacks(film.title, year, apiToken);
      results.push({ resolved, originalTitle: film.title });
    } catch {
      results.push({ resolved: null, originalTitle: film.title });
    }

    // Polite rate limiting between TMDB requests
    await new Promise((r) => setTimeout(r, 120));
  }

  return results;
}
