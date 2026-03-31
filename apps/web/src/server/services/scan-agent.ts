/**
 * Scan Agent — Discovers Letterboxd profiles with similar film taste.
 *
 * Strategy:
 * 1. Fetch the source user's liked films/watchlist/activity
 * 2. For each liked/watched film, visit the Letterboxd film page
 *    and collect usernames of people who also liked that film
 * 3. Score each discovered profile against the source user
 * 4. Return top matches ranked by compatibility score
 *
 * This creates a "taste graph" starting from films the user loves,
 * finding people via shared taste signals rather than random discovery.
 */

import {
  fetchExploreAllSources,
  type ExploreFilm,
} from './explore-scraper';
import { computeExploreMatch, type ExploreUserData } from './explore-matcher';

const LETTERBOXD_BASE = 'https://letterboxd.com';
const USER_AGENT =
  'Mozilla/5.0 (compatible; ReelsScan/1.0; +https://github.com/rtharakan/reels)';

// Polite crawl delay between requests (ms)
const CRAWL_DELAY = 600;

export interface ScanResult {
  username: string;
  displayName: string;
  score: number;
  sharedFilmsCount: number;
  sharedLikedCount: number;
  profileUrl: string;
  label: string;
}

export interface ScanProgress {
  phase: 'fetching-profile' | 'discovering-users' | 'scoring' | 'complete';
  filmsScanned: number;
  totalFilms: number;
  usersFound: number;
  usersScored: number;
  totalToScore: number;
}

function getLabel(score: number): string {
  if (score >= 0.5) return 'Soul Mates';
  if (score >= 0.3) return 'Great Match';
  if (score >= 0.15) return 'Good Vibes';
  if (score >= 0.05) return 'Film Friends';
  return 'Some Overlap';
}

/**
 * Scrape a Letterboxd film page to find usernames from popular reviews and activity.
 * Uses the film's main page which is accessible (not behind Cloudflare challenge).
 * Falls back to fans/members pages if they're accessible.
 */
async function discoverFansOfFilm(
  filmSlug: string,
  maxPages: number = 1,
): Promise<string[]> {
  const usernames: Set<string> = new Set();

  // Non-user path segments to filter out
  const EXCLUDED_PATHS = new Set([
    'film', 'films', 'list', 'lists', 'members', 'activity',
    'journal', 'search', 'settings', 'about', 'pro', 'patron',
    'tag', 'tags', 'crew', 'actor', 'director', 'producer',
    'cinematography', 'writing', 'editing', 'soundtrack',
    'visual-effects', 'art-direction', 'costume-design',
    'fans', 'likes', 'reviews', 'ratings', 'stats', 'genres',
    'year', 'popular', 'recent', 'this', 'calendar',
    'cookie-consent', 'sign-in', 'create-account', 'legal',
    'contact', 'welcome', 'apps', 'api-beta', 'gift-guide',
    'year-in-review',
  ]);

  function extractUsernamesFromHtml(html: string) {
    // Cloudflare challenge detection
    if (html.includes('Just a moment...') || html.includes('cf_chl_opt')) return;

    // Strategy 1: Avatar/person card links — href="/username/"
    const avatarPattern = /href="\/([a-zA-Z0-9_-]{2,30})\/"/g;
    let match;
    while ((match = avatarPattern.exec(html)) !== null) {
      const name = match[1]!;
      if (!EXCLUDED_PATHS.has(name.toLowerCase())) {
        usernames.add(name);
      }
    }

    // Strategy 2: data-person attribute (newer Letterboxd markup)
    const dataPersonPattern = /data-person="([a-zA-Z0-9_-]+)"/g;
    while ((match = dataPersonPattern.exec(html)) !== null) {
      if (match[1]) usernames.add(match[1]);
    }
  }

  // Primary: film main page (always accessible, has popular reviews)
  try {
    const res = await fetch(`${LETTERBOXD_BASE}/film/${filmSlug}/`, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    if (res.ok) {
      const html = await res.text();
      extractUsernamesFromHtml(html);
    }
  } catch { /* non-fatal */ }

  // Fallback: try fans/members/likes pages (may be behind Cloudflare)
  if (usernames.size < 3) {
    const fallbackUrls = [
      `${LETTERBOXD_BASE}/film/${filmSlug}/fans/`,
      `${LETTERBOXD_BASE}/film/${filmSlug}/members/`,
      `${LETTERBOXD_BASE}/film/${filmSlug}/likes/`,
    ];

    for (const baseUrl of fallbackUrls) {
      for (let page = 1; page <= maxPages; page++) {
        const url = page === 1 ? baseUrl : baseUrl + `page/${page}/`;
        try {
          const res = await fetch(url, {
            headers: {
              'User-Agent': USER_AGENT,
              Accept: 'text/html,application/xhtml+xml',
              'Accept-Language': 'en-US,en;q=0.9',
            },
          });
          if (!res.ok) break;
          const html = await res.text();
          extractUsernamesFromHtml(html);
          if (!html.includes('class="next"') && !html.includes('rel="next"')) break;
        } catch { break; }
        await new Promise((r) => setTimeout(r, CRAWL_DELAY));
      }
      if (usernames.size > 5) break;
      await new Promise((r) => setTimeout(r, CRAWL_DELAY));
    }
  }

  return Array.from(usernames);
}

/**
 * Discover users who are active on the same films the source user likes.
 * Samples from the user's top-liked and most-watched films.
 */
async function discoverCandidateUsernames(
  sourceUsername: string,
  sourceData: { liked: ExploreFilm[]; watched: ExploreFilm[]; watchlist: { films: ExploreFilm[] } },
  maxFilmsToScan: number = 10,
  onProgress?: (p: Partial<ScanProgress>) => void,
): Promise<string[]> {
  // Prioritize liked films (strongest signal), then watched, then watchlist as fallback
  const seedFilms: ExploreFilm[] = [];
  const seen = new Set<string>();

  for (const film of sourceData.liked) {
    if (!seen.has(film.letterboxdSlug)) {
      seedFilms.push(film);
      seen.add(film.letterboxdSlug);
    }
  }
  for (const film of sourceData.watched) {
    if (!seen.has(film.letterboxdSlug)) {
      seedFilms.push(film);
      seen.add(film.letterboxdSlug);
    }
  }
  // Fallback: use watchlist films when liked/watched are empty (Cloudflare blocks)
  if (seedFilms.length === 0) {
    for (const film of sourceData.watchlist.films) {
      if (!seen.has(film.letterboxdSlug)) {
        seedFilms.push(film);
        seen.add(film.letterboxdSlug);
      }
    }
  }

  const filmsToScan = seedFilms.slice(0, maxFilmsToScan);
  // Use lowercase keys to prevent case-sensitive duplicates (e.g. "JohnDoe" vs "johndoe")
  const allUsernames = new Set<string>();

  for (let i = 0; i < filmsToScan.length; i++) {
    const film = filmsToScan[i]!;
    onProgress?.({
      phase: 'discovering-users',
      filmsScanned: i + 1,
      totalFilms: filmsToScan.length,
    });

    const fans = await discoverFansOfFilm(film.letterboxdSlug, 1);
    for (const name of fans) {
      const nameLower = name.toLowerCase();
      if (nameLower !== sourceUsername.toLowerCase() && !allUsernames.has(nameLower)) {
        allUsernames.add(nameLower);
      }
    }

    await new Promise((r) => setTimeout(r, CRAWL_DELAY));
  }

  return Array.from(allUsernames);
}

/**
 * Run the Scan agent: find Letterboxd users with similar taste.
 *
 * @param username - Source Letterboxd username
 * @param options - Configuration for scan depth
 * @returns Ranked list of compatible profiles
 */
export async function runScanAgent(
  username: string,
  options: {
    maxFilmsToScan?: number; // How many seed films to explore (default: 8)
    maxProfilesToScore?: number; // Max profiles to fully score (default: 20)
    onProgress?: (p: ScanProgress) => void;
  } = {},
): Promise<ScanResult[]> {
  const {
    maxFilmsToScan = 8,
    maxProfilesToScore = 20,
    onProgress,
  } = options;

  // Phase 1: Fetch the source user's profile
  onProgress?.({
    phase: 'fetching-profile',
    filmsScanned: 0,
    totalFilms: 0,
    usersFound: 0,
    usersScored: 0,
    totalToScore: 0,
  });

  const sourceData = await fetchExploreAllSources(username);

  if (
    sourceData.watchlist.films.length === 0 &&
    sourceData.watched.length === 0 &&
    sourceData.liked.length === 0
  ) {
    throw new Error(`${username}'s profile appears empty or private. Ensure your Letterboxd profile and watchlist are public.`);
  }

  // Phase 2: Discover candidate usernames by crawling film fan pages
  const candidates = await discoverCandidateUsernames(
    username,
    sourceData,
    maxFilmsToScan,
    (p) => onProgress?.({ ...p, usersFound: 0, usersScored: 0, totalToScore: 0 } as ScanProgress),
  );

  onProgress?.({
    phase: 'discovering-users',
    filmsScanned: maxFilmsToScan,
    totalFilms: maxFilmsToScan,
    usersFound: candidates.length,
    usersScored: 0,
    totalToScore: Math.min(candidates.length, maxProfilesToScore),
  });

  if (candidates.length === 0) {
    return [];
  }

  // Phase 3: Score each candidate
  const toScore = candidates.slice(0, maxProfilesToScore);
  const results: ScanResult[] = [];

  const sourceUserData: ExploreUserData = {
    watchlist: sourceData.watchlist.films,
    watched: sourceData.watched,
    liked: sourceData.liked,
    highRated: sourceData.liked, // Use liked as quality proxy
  };

  for (let i = 0; i < toScore.length; i++) {
    const candidateUsername = toScore[i]!;
    onProgress?.({
      phase: 'scoring',
      filmsScanned: maxFilmsToScan,
      totalFilms: maxFilmsToScan,
      usersFound: candidates.length,
      usersScored: i + 1,
      totalToScore: toScore.length,
    });

    try {
      const candidateData = await fetchExploreAllSources(candidateUsername);

      if (
        candidateData.watchlist.films.length === 0 &&
        candidateData.watched.length === 0 &&
        candidateData.liked.length === 0
      ) {
        continue; // Skip empty/private profiles
      }

      const candidateUserData: ExploreUserData = {
        watchlist: candidateData.watchlist.films,
        watched: candidateData.watched,
        liked: candidateData.liked,
        highRated: candidateData.liked,
      };

      const matchResult = computeExploreMatch(sourceUserData, candidateUserData);

      if (matchResult.combinedScore > 0.01) {
        results.push({
          username: candidateUsername,
          displayName: candidateData.watchlist.displayName || candidateUsername,
          score: matchResult.combinedScore,
          sharedFilmsCount: matchResult.sharedFilms.length,
          sharedLikedCount: matchResult.sharedLikedFilms.length,
          profileUrl: `https://letterboxd.com/${candidateUsername}/`,
          label: getLabel(matchResult.combinedScore),
        });
      }
    } catch {
      // Skip profiles that fail to fetch
      continue;
    }

    // Polite delay between profile fetches
    await new Promise((r) => setTimeout(r, CRAWL_DELAY));
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  onProgress?.({
    phase: 'complete',
    filmsScanned: maxFilmsToScan,
    totalFilms: maxFilmsToScan,
    usersFound: candidates.length,
    usersScored: toScore.length,
    totalToScore: toScore.length,
  });

  return results;
}
