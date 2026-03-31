/**
 * Letterboxd Client Abstraction Layer
 *
 * This module provides a unified interface for fetching Letterboxd user data.
 * Currently it uses public HTML scraping. When Letterboxd's official API becomes
 * available, replace the implementation inside each method — the interface stays
 * identical, requiring zero changes to callers.
 *
 * Migration path:
 *   1. Obtain API credentials from Letterboxd Developer portal.
 *   2. Set LETTERBOXD_API_KEY + LETTERBOXD_API_SECRET in environment.
 *   3. Swap the `_scrapeImpl` calls below for `_apiImpl` calls.
 *   4. Delete the scraping helper files once the API is stable.
 */

import { scrapeWatchlist, type ScrapedFilm } from './scraper';

/**
 * A single film entry as returned by the Letterboxd client.
 * Mirrors the shape used by the API v0.1 spec.
 */
export interface LBFilm {
  /** Letterboxd film slug (e.g. "the-matrix-1999") */
  slug: string;
  /** Human-readable film title */
  title: string;
  /** Release year, if known */
  year?: number;
  /** Letterboxd canonical URL */
  url: string;
}

/**
 * User watchlist response.
 */
export interface LBWatchlist {
  username: string;
  displayName: string;
  films: LBFilm[];
  totalCount: number;
  fetchedAt: string;
}

/**
 * User watched, liked, and rated film lists.
 * Populated from the film tab on public profiles.
 */
export interface LBUserActivity {
  username: string;
  watched: LBFilm[];
  liked: LBFilm[];
  /** Films rated ≥4 stars (high quality signal) */
  highRated: LBFilm[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Provider detection — swap this to 'api' once credentials are available.
// ──────────────────────────────────────────────────────────────────────────────
type Provider = 'scrape' | 'api';

function getProvider(): Provider {
  // When LETTERBOXD_API_KEY is set, use the official API (not yet available publicly).
  return process.env.LETTERBOXD_API_KEY ? 'api' : 'scrape';
}

// ──────────────────────────────────────────────────────────────────────────────
// Scraping implementation (current)
// ──────────────────────────────────────────────────────────────────────────────

async function _scrapeGetWatchlist(username: string): Promise<LBWatchlist> {
  const raw = await scrapeWatchlist(username);
  return {
    username,
    displayName: username,
    films: raw.films.map(toFilm),
    totalCount: raw.films.length,
    fetchedAt: new Date().toISOString(),
  };
}

function toFilm(entry: ScrapedFilm): LBFilm {
  // Extract year from slug (e.g. "the-matrix-1999" → 1999)
  const yearMatch = entry.slug.match(/-(\d{4})(?:-\d+)?$/);
  const year = yearMatch?.[1] ? parseInt(yearMatch[1], 10) : undefined;
  return {
    slug: entry.slug,
    title: entry.title,
    year,
    url: `https://letterboxd.com/film/${entry.slug}/`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// API implementation placeholder (future)
// ──────────────────────────────────────────────────────────────────────────────

async function _apiGetWatchlist(_username: string): Promise<LBWatchlist> {
  // TODO: implement after API credentials are available.
  // Reference: https://api-docs.letterboxd.com/#operation/getMemberWatchlist
  throw new Error('Letterboxd API not yet available. Set LETTERBOXD_API_KEY when ready.');
}

// ──────────────────────────────────────────────────────────────────────────────
// Public interface
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetch a user's public watchlist.
 * Automatically uses the official API when credentials are configured,
 * otherwise falls back to polite HTML scraping.
 */
export async function getWatchlist(username: string): Promise<LBWatchlist> {
  const provider = getProvider();
  if (provider === 'api') return _apiGetWatchlist(username);
  return _scrapeGetWatchlist(username);
}

/**
 * Check whether the official Letterboxd API is configured and available.
 * Use this for health checks or to conditionally surface API-only features.
 */
export function isApiAvailable(): boolean {
  return Boolean(process.env.LETTERBOXD_API_KEY && process.env.LETTERBOXD_API_SECRET);
}
