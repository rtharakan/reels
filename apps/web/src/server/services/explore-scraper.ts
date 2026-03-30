/**
 * Letterboxd watchlist scraper for the Explore feature.
 * Fetches a user's public watchlist from Letterboxd.
 * Adapted from https://github.com/rtharakan/letterboxd-watchlist
 */

const LETTERBOXD_BASE_URL = 'https://letterboxd.com';
const USER_AGENT =
  'Mozilla/5.0 (compatible; ReelsExplore/1.0; +https://github.com/rtharakan/reels)';

export interface ExploreFilm {
  letterboxdSlug: string;
  title: string;
  year?: number;
  posterUrl?: string;
  letterboxdUrl?: string;
}

export interface ExploreWatchlistResponse {
  username: string;
  displayName: string;
  films: ExploreFilm[];
  totalCount: number;
  fetchedAt: string;
}

function parseFilmFromHtml(filmElement: string): ExploreFilm | null {
  const slugMatch =
    filmElement.match(/data-item-slug="([^"]+)"/) ||
    filmElement.match(/data-film-slug="([^"]+)"/);
  const slug = slugMatch?.[1];
  if (!slug) return null;

  const titleMatch =
    filmElement.match(/data-item-name="([^"]+)"/) ||
    filmElement.match(/alt="([^"]+)"/);
  let title = titleMatch?.[1] || slug.replace(/-/g, ' ');

  let year: number | undefined;
  const yearMatch = title.match(/\((\d{4})\)$/);
  if (yearMatch?.[1]) {
    year = parseInt(yearMatch[1], 10);
    title = title.replace(/\s*\(\d{4}\)$/, '').trim();
  }

  const dataYearMatch = filmElement.match(/data-film-year="(\d{4})"/);
  if (dataYearMatch?.[1]) {
    year = parseInt(dataYearMatch[1], 10);
  }

  let posterUrl: string | undefined;

  // Try multiple poster URL extraction strategies
  // Priority 1: Direct poster URL attribute
  const posterUrlMatch = filmElement.match(/data-poster-url="([^"]+)"/);
  if (posterUrlMatch) posterUrl = posterUrlMatch[1];

  // Priority 2: Data-image attribute
  if (!posterUrl) {
    const dataImageMatch = filmElement.match(/data-image="([^"]+)"/);
    if (dataImageMatch) posterUrl = dataImageMatch[1];
  }

  // Priority 3: TMDB poster from Letterboxd (they sometimes embed TMDB URLs)
  if (!posterUrl) {
    const tmdbMatch = filmElement.match(
      /src="(https:\/\/image\.tmdb\.org\/t\/p\/[^"]+)"/
    );
    if (tmdbMatch) posterUrl = tmdbMatch[1];
  }

  // Priority 4: Direct Letterboxd CDN image
  if (!posterUrl) {
    const srcMatch = filmElement.match(
      /src="(https:\/\/[^"]*(?:ltrbxd|letterboxd)[^"]*\.(?:jpg|webp|png)[^"]*)"/
    );
    if (srcMatch) posterUrl = srcMatch[1];
  }

  // Upscale Letterboxd CDN thumbnails to full poster size
  if (posterUrl && posterUrl.includes('ltrbxd.com')) {
    posterUrl = posterUrl.replace(/-\d+-\d+-\d+-\d+-crop/, '-0-230-0-345-crop');
    posterUrl = posterUrl.replace(/\/0-\d+-0-\d+\//, '/0-230-0-345/');
  }

  return {
    letterboxdSlug: slug,
    title: title.trim(),
    year,
    posterUrl,
    letterboxdUrl: `https://letterboxd.com/film/${slug}/`,
  };
}

function parseWatchlistPage(html: string): ExploreFilm[] {
  const films: ExploreFilm[] = [];

  const reactPattern =
    /<div[^>]*class="react-component"[^>]*data-item-slug="[^"]*"[^>]*>/g;
  const reactMatches = html.match(reactPattern) || [];

  for (const filmHtml of reactMatches) {
    const film = parseFilmFromHtml(filmHtml);
    if (film) films.push(film);
  }

  if (films.length === 0) {
    const filmPattern =
      /<li[^>]*class="[^"]*poster-container[^"]*"[^>]*>[\s\S]*?<\/li>/g;
    const filmMatches = html.match(filmPattern) || [];
    for (const filmHtml of filmMatches) {
      const film = parseFilmFromHtml(filmHtml);
      if (film) films.push(film);
    }
  }

  if (films.length === 0) {
    const altPattern = /<div[^>]*data-film-slug="[^"]*"[^>]*>[\s\S]*?<\/div>/g;
    const altMatches = html.match(altPattern) || [];
    for (const filmHtml of altMatches) {
      const film = parseFilmFromHtml(filmHtml);
      if (film) films.push(film);
    }
  }

  return films;
}

function hasNextPage(html: string): boolean {
  return html.includes('class="next"') || html.includes('rel="next"');
}

function getDisplayName(html: string, username: string): string {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch?.[1]) {
    const nameMatch = titleMatch[1].match(
      /Watchlist\s*[•\-–—]\s*(.+?)(?:\s*[•\-–—]|$)/i
    );
    if (nameMatch?.[1]) return nameMatch[1].trim();
  }
  const ogTitleMatch = html.match(
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/
  );
  if (ogTitleMatch?.[1]) {
    const nameMatch = ogTitleMatch[1].match(
      /Watchlist\s*[•\-–—]\s*(.+?)(?:\s*[•\-–—]|$)/i
    );
    if (nameMatch?.[1]) return nameMatch[1].trim();
  }
  return username;
}

async function fetchWatchlistPage(
  username: string,
  page: number
): Promise<string> {
  const url =
    page === 1
      ? `${LETTERBOXD_BASE_URL}/${username}/watchlist/`
      : `${LETTERBOXD_BASE_URL}/${username}/watchlist/page/${page}/`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (response.status === 404) {
    throw new Error(
      `User "${username}" not found or watchlist is private`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch watchlist: ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}

export async function fetchExploreWatchlist(
  username: string
): Promise<ExploreWatchlistResponse> {
  const allFilms: ExploreFilm[] = [];
  let page = 1;
  let hasMore = true;
  let displayName = username;
  const maxPages = 100;

  while (hasMore && page <= maxPages) {
    const html = await fetchWatchlistPage(username, page);

    if (page === 1) {
      displayName = getDisplayName(html, username);
      if (
        html.includes('No films in this list') ||
        html.includes('watchlist is empty')
      ) {
        return {
          username,
          displayName,
          films: [],
          totalCount: 0,
          fetchedAt: new Date().toISOString(),
        };
      }
    }

    const films = parseWatchlistPage(html);
    allFilms.push(...films);
    hasMore = hasNextPage(html) && films.length > 0;
    page++;

    // Polite crawl delay
    await new Promise((r) => setTimeout(r, 500));
  }

  return {
    username,
    displayName,
    films: allFilms,
    totalCount: allFilms.length,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Generic Letterboxd list page fetcher (films, likes, ratings).
 * Uses the same parsing logic as watchlist but for different URL paths.
 */
async function fetchExploreListPage(
  username: string,
  path: string,
  maxPages = 20,
): Promise<ExploreFilm[]> {
  const allFilms: ExploreFilm[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= maxPages) {
    const url = page === 1
      ? `${LETTERBOXD_BASE_URL}/${username}/${path}/`
      : `${LETTERBOXD_BASE_URL}/${username}/${path}/page/${page}/`;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      if (!response.ok) break;
      const html = await response.text();
      const films = parseWatchlistPage(html);
      allFilms.push(...films);
      hasMore = hasNextPage(html) && films.length > 0;
    } catch {
      break;
    }

    page++;
    if (hasMore) await new Promise((r) => setTimeout(r, 500));
  }

  return allFilms;
}

/** Fetch a user's watched films (Letterboxd /username/films/) */
export async function fetchExploreFilms(username: string): Promise<ExploreFilm[]> {
  return fetchExploreListPage(username, 'films');
}

/** Fetch a user's liked films (Letterboxd /username/likes/films/) */
export async function fetchExploreLikes(username: string): Promise<ExploreFilm[]> {
  return fetchExploreListPage(username, 'likes/films');
}

/**
 * Fetch all Letterboxd data sources for a user in parallel.
 * Returns watchlist, watched films, and liked films.
 * (Ratings page doesn't reliably expose rating values via HTML scraping,
 * so we use liked films as the quality proxy instead.)
 */
export async function fetchExploreAllSources(username: string): Promise<{
  watchlist: ExploreWatchlistResponse;
  watched: ExploreFilm[];
  liked: ExploreFilm[];
}> {
  const [watchlist, watched, liked] = await Promise.all([
    fetchExploreWatchlist(username),
    fetchExploreFilms(username),
    fetchExploreLikes(username),
  ]);

  return { watchlist, watched, liked };
}

export async function validateExploreUsername(
  username: string
): Promise<boolean> {
  try {
    const response = await fetch(`${LETTERBOXD_BASE_URL}/${username}/`, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
