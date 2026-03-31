/**
 * Letterboxd data fetcher for the Explore feature.
 *
 * Data source: Letterboxd public activity RSS feed (/username/rss/)
 *
 * Letterboxd's HTML pages are now JavaScript-rendered (Vite/SPA) — the film
 * tiles are not present in the initial server response and cannot be scraped
 * reliably. The RSS feed is intentionally machine-readable and publicly accessible,
 * providing watched films with ratings, like status, and TMDB IDs.
 *
 * When Letterboxd's official API becomes available, replace the RSS parsing
 * with API calls — the public interface (ExploreFilm, ExploreWatchlistResponse,
 * fetchExploreAllSources) stays unchanged.
 *
 * RSS field mapping:
 *   watched   → all <item> entries in the feed
 *   liked     → items where <letterboxd:memberLike>Yes</letterboxd:memberLike>
 *   highRated → items where <letterboxd:memberRating> >= 4.0
 *   posterUrl → embedded in <description> CDATA as <img src="...">
 *   tmdbId    → <tmdb:movieId> (used for direct poster resolution)
 */

const LETTERBOXD_BASE_URL = 'https://letterboxd.com';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface ExploreFilm {
  letterboxdSlug: string;
  title: string;
  year?: number;
  posterUrl?: string;
  letterboxdUrl?: string;
  tmdbId?: number;
}

export interface ExploreWatchlistResponse {
  username: string;
  displayName: string;
  films: ExploreFilm[];
  totalCount: number;
  fetchedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// RSS parsing helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extract text from a simple XML tag (handles both plain text and CDATA). */
function xmlText(xml: string, tag: string): string | undefined {
  const escaped = tag.replace(':', '\\:');
  const cdataRe = new RegExp(`<${escaped}><!\\[CDATA\\[([^\\]]+)\\]\\]><\\/${escaped}>`);
  const plainRe  = new RegExp(`<${escaped}>([^<]+)<\\/${escaped}>`);
  return xml.match(cdataRe)?.[1]?.trim() ?? xml.match(plainRe)?.[1]?.trim();
}

/**
 * Parse a single RSS <item> block into an ExploreFilm.
 * Returns null if essential data (title or slug) is missing.
 */
function parseRSSItem(
  item: string,
): (ExploreFilm & { memberRating?: number; memberLike?: boolean }) | null {
  const title = xmlText(item, 'letterboxd:filmTitle');
  if (!title) return null;

  const yearStr = xmlText(item, 'letterboxd:filmYear');
  const year = yearStr ? parseInt(yearStr, 10) : undefined;

  const ratingStr = xmlText(item, 'letterboxd:memberRating');
  const memberRating = ratingStr ? parseFloat(ratingStr) : undefined;

  const memberLike = /letterboxd:memberLike>Yes</.test(item);

  const tmdbStr = xmlText(item, 'tmdb:movieId');
  const tmdbId = tmdbStr ? parseInt(tmdbStr, 10) : undefined;

  // Extract film slug from the member's personal film URL:
  //   /username/film/some-slug/1/  →  some-slug
  const linkMatch = item.match(
    /<link>https:\/\/letterboxd\.com\/[^/]+\/film\/([^/]+)\//,
  );
  const slug = linkMatch?.[1];
  if (!slug) return null;

  // Extract poster from description CDATA: <img src="https://a.ltrbxd.com/...jpg">
  const posterMatch = item.match(
    /src="(https:\/\/a\.ltrbxd\.com\/resized\/film-poster\/[^"]+\.jpg[^"]*)"/,
  );
  const posterUrl = posterMatch?.[1];

  return {
    letterboxdSlug: slug,
    title,
    year,
    posterUrl,
    letterboxdUrl: `${LETTERBOXD_BASE_URL}/film/${slug}/`,
    tmdbId,
    memberRating,
    memberLike,
  };
}

/** Extract display name from the RSS channel title ("Letterboxd - DisplayName"). */
function parseDisplayName(xml: string, fallback: string): string {
  const channelTitle = xml.match(/<channel>\s*<title>([^<]+)<\/title>/)?.[1];
  if (!channelTitle) return fallback;
  // Format: "Letterboxd - WOXX"
  const parts = channelTitle.split(' - ');
  return parts.length >= 2 ? parts.slice(1).join(' - ').trim() : fallback;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch helpers
// ─────────────────────────────────────────────────────────────────────────────

const RSS_HEADERS = {
  'User-Agent': USER_AGENT,
  Accept: 'application/rss+xml,application/xml,text/xml,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

/**
 * Fetch the activity RSS feed for a Letterboxd user.
 * Returns the raw XML string, or throws with a user-facing error.
 */
async function fetchActivityRSS(username: string): Promise<string> {
  const url = `${LETTERBOXD_BASE_URL}/${username}/rss/`;
  let res: Response;
  try {
    res = await fetch(url, { headers: RSS_HEADERS });
  } catch (err) {
    throw new Error(
      `Network error fetching Letterboxd data for "${username}". Check your connection.`,
    );
  }

  if (res.status === 404) {
    throw new Error(
      `Letterboxd user "${username}" not found. Check the username and try again.`,
    );
  }
  if (res.status === 403) {
    throw new Error(
      `"${username}"'s Letterboxd profile is private. Make sure their profile is set to public.`,
    );
  }
  if (!res.ok) {
    throw new Error(
      `Failed to fetch Letterboxd data for "${username}" (HTTP ${res.status}).`,
    );
  }

  const xml = await res.text();
  if (!xml.includes('<rss') && !xml.includes('<channel>')) {
    throw new Error(
      `Unexpected response from Letterboxd for "${username}". The profile may be private or inaccessible.`,
    );
  }

  return xml;
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API (unchanged interface from HTML-scraping version)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all data sources for a Letterboxd user via the public activity RSS feed.
 *
 * The feed provides:
 *   - watched  — all recently rated/logged films (up to ~50 most recent)
 *   - liked    — films where the user pressed "Like" (heart) on Letterboxd
 *   - highRated — films rated ≥ 4 stars
 *
 * Watchlist data is not currently available via public RSS (the endpoint
 * returns 403). When Letterboxd's official API becomes available, this
 * function can populate watchlist without changing any callers.
 */
export async function fetchExploreAllSources(username: string): Promise<{
  watchlist: ExploreWatchlistResponse;
  watched: ExploreFilm[];
  liked: ExploreFilm[];
  highRated: ExploreFilm[];
}> {
  const xml = await fetchActivityRSS(username);
  const displayName = parseDisplayName(xml, username);

  // Split XML into individual <item> blocks
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [];

  const watched: ExploreFilm[] = [];
  const liked: ExploreFilm[] = [];
  const highRated: ExploreFilm[] = [];

  for (const block of itemBlocks) {
    const film = parseRSSItem(block);
    if (!film) continue;

    const { memberRating, memberLike, ...baseFilm } = film;

    watched.push(baseFilm);
    if (memberLike) liked.push(baseFilm);
    if (memberRating !== undefined && memberRating >= 4.0) highRated.push(baseFilm);
  }

  // Watchlist returns empty — gracefully handled by the matching engine
  // (zero watchlist signal, other four signals still contribute to the score).
  const watchlist: ExploreWatchlistResponse = {
    username,
    displayName,
    films: [],
    totalCount: watched.length,
    fetchedAt: new Date().toISOString(),
  };

  return { watchlist, watched, liked, highRated };
}

/** @deprecated Use fetchExploreAllSources instead. */
export async function fetchExploreWatchlist(username: string): Promise<ExploreWatchlistResponse> {
  const { watchlist } = await fetchExploreAllSources(username);
  return watchlist;
}

/** @deprecated Use fetchExploreAllSources instead. */
export async function fetchExploreFilms(username: string): Promise<ExploreFilm[]> {
  const { watched } = await fetchExploreAllSources(username);
  return watched;
}

/** @deprecated Use fetchExploreAllSources instead. */
export async function fetchExploreLikes(username: string): Promise<ExploreFilm[]> {
  const { liked } = await fetchExploreAllSources(username);
  return liked;
}

/**
 * Check whether a Letterboxd username exists and has a public profile.
 */
export async function validateExploreUsername(username: string): Promise<boolean> {
  try {
    const res = await fetch(`${LETTERBOXD_BASE_URL}/${username}/rss/`, {
      method: 'HEAD',
      headers: RSS_HEADERS,
    });
    return res.ok;
  } catch {
    return false;
  }
}
