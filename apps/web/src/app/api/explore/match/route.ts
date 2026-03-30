/**
 * POST /api/explore/match
 * Public endpoint — no authentication required.
 * Accepts two Letterboxd usernames, scrapes watchlists, computes match,
 * and optionally finds shared films playing in a Dutch city.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchExploreAllSources } from '@/server/services/explore-scraper';
import { computeExploreMatch } from '@/server/services/explore-matcher';
import { fetchCityScreenings, DUTCH_CITIES } from '@/server/services/explore-screenings';
import { findExploreMatchingScreenings } from '@/server/services/explore-film-matcher';
import { rateLimit } from '@/lib/rate-limit';
import type { ExploreFilm } from '@/server/services/explore-scraper';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';

// In-memory poster cache to avoid redundant TMDB API calls within the same process
const posterCache = new Map<string, string | null>();

function posterCacheKey(title: string, year: number | undefined): string {
  return `${title.toLowerCase().trim()}::${year ?? ''}`;
}

async function resolveTMDBPoster(
  title: string,
  year: number | undefined,
  apiToken: string,
): Promise<string | null> {
  const key = posterCacheKey(title, year);
  if (posterCache.has(key)) return posterCache.get(key) ?? null;

  const params = new URLSearchParams({ query: title });
  if (year) params.set('primary_release_year', String(year));

  const res = await fetch(`${TMDB_API_BASE}/search/movie?${params}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 429) {
    // TMDB rate limit — wait and retry once
    const retryAfter = parseInt(res.headers.get('Retry-After') ?? '2', 10);
    await new Promise((r) => setTimeout(r, retryAfter * 1000));
    const retryRes = await fetch(`${TMDB_API_BASE}/search/movie?${params}`, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!retryRes.ok) { posterCache.set(key, null); return null; }
    const retryData = await retryRes.json();
    const retryMovie = retryData.results?.[0];
    const retryUrl = retryMovie?.poster_path
      ? `https://image.tmdb.org/t/p/w342${retryMovie.poster_path}`
      : null;
    posterCache.set(key, retryUrl);
    return retryUrl;
  }

  if (!res.ok) { posterCache.set(key, null); return null; }
  const data = await res.json();
  const movie = data.results?.[0];
  const posterUrl = movie?.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;
  posterCache.set(key, posterUrl);
  return posterUrl;
}

/**
 * Always resolve posters via TMDB for all films.
 * Letterboxd HTML scraping produces unreliable poster URLs because
 * their pages use React lazy-loading and the src/data attributes
 * may not be present in raw HTML responses.
 * Falls back to the Letterboxd-scraped URL only when TMDB fails.
 */
async function enrichPostersWithTMDB(
  films: ExploreFilm[],
): Promise<ExploreFilm[]> {
  const apiToken = process.env.TMDB_API_READ_ACCESS_TOKEN ?? process.env.TMDB_API_TOKEN;
  if (!apiToken) {
    console.warn('[Explore] TMDB_API_READ_ACCESS_TOKEN not set — film posters will be missing. Get a free token at https://www.themoviedb.org/settings/api');
    return films;
  }

  // Process in batches of 8 to respect TMDB rate limits (~40 req/10s)
  const BATCH_SIZE = 8;
  const enriched: ExploreFilm[] = [];

  for (let i = 0; i < films.length; i += BATCH_SIZE) {
    const batch = films.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(async (film) => {
        try {
          const tmdbPoster = await resolveTMDBPoster(film.title, film.year, apiToken);
          // Prefer TMDB poster; fall back to Letterboxd-scraped URL
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

// Basic username validation
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,40}$/;

function extractUsername(input: string): string {
  const cleaned = input.trim();
  // Handle full Letterboxd URLs
  const urlMatch = cleaned.match(
    /(?:https?:\/\/)?(?:www\.)?letterboxd\.com\/([a-zA-Z0-9_-]+)/
  );
  if (urlMatch?.[1]) return urlMatch[1];
  // Handle @username format
  if (cleaned.startsWith('@')) return cleaned.slice(1);
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 requests per minute per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rl = rateLimit(ip, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        },
      );
    }

    const body = await request.json();
    const { user1: rawUser1, user2: rawUser2, city } = body as {
      user1?: string;
      user2?: string;
      city?: string;
    };

    if (!rawUser1 || !rawUser2) {
      return NextResponse.json(
        { error: 'Both user1 and user2 are required', code: 'MISSING_USERS' },
        { status: 400 }
      );
    }

    const user1 = extractUsername(rawUser1);
    const user2 = extractUsername(rawUser2);

    if (!USERNAME_REGEX.test(user1) || !USERNAME_REGEX.test(user2)) {
      return NextResponse.json(
        { error: 'Invalid username format', code: 'INVALID_USERNAME' },
        { status: 400 }
      );
    }

    if (user1.toLowerCase() === user2.toLowerCase()) {
      return NextResponse.json(
        { error: 'Please enter two different usernames', code: 'SAME_USER' },
        { status: 400 }
      );
    }

    // Fetch all Letterboxd data sources in parallel for both users
    const [data1, data2] = await Promise.all([
      fetchExploreAllSources(user1),
      fetchExploreAllSources(user2),
    ]);

    if (data1.watchlist.films.length === 0 && data1.watched.length === 0) {
      return NextResponse.json(
        {
          error: `${user1}'s profile is empty or private`,
          code: 'EMPTY_WATCHLIST_1',
        },
        { status: 200 }
      );
    }

    if (data2.watchlist.films.length === 0 && data2.watched.length === 0) {
      return NextResponse.json(
        {
          error: `${user2}'s profile is empty or private`,
          code: 'EMPTY_WATCHLIST_2',
        },
        { status: 200 }
      );
    }

    // Compute enhanced match using all available signals
    const matchResult = computeExploreMatch(
      {
        watchlist: data1.watchlist.films,
        watched: data1.watched,
        liked: data1.liked,
        highRated: data1.liked, // Liked films serve as quality proxy
      },
      {
        watchlist: data2.watchlist.films,
        watched: data2.watched,
        liked: data2.liked,
        highRated: data2.liked,
      },
    );

    // Enrich shared films with TMDB posters for missing poster URLs
    const enrichedSharedFilms = await enrichPostersWithTMDB(matchResult.sharedFilms);

    // If a city is provided, find screenings of shared films
    let dateIdeas: {
      filmTitle: string;
      cinemaName: string;
      date: string;
      time: string;
      ticketUrl?: string;
    }[] = [];

    const selectedCity = city && DUTCH_CITIES.some((c) => c.slug === city) ? city : null;

    if (selectedCity && matchResult.sharedFilms.length > 0) {
      try {
        const screenings = await fetchCityScreenings(selectedCity);
        const matched = findExploreMatchingScreenings(
          matchResult.sharedFilms,
          screenings
        );
        dateIdeas = matched.map((m) => ({
          filmTitle: m.film.title,
          cinemaName: m.screening.cinemaName,
          date: m.screening.date,
          time: m.screening.time,
          ticketUrl: m.screening.ticketUrl,
        }));
      } catch (err) {
        console.error('[Explore] Failed to fetch screenings:', err);
        // Non-fatal — we still return the match result
      }
    }

    return NextResponse.json({
      user1: {
        username: data1.watchlist.username,
        displayName: data1.watchlist.displayName,
        filmCount: data1.watchlist.totalCount + data1.watched.length,
      },
      user2: {
        username: data2.watchlist.username,
        displayName: data2.watchlist.displayName,
        filmCount: data2.watchlist.totalCount + data2.watched.length,
      },
      match: {
        overlapScore: matchResult.overlapScore,
        genreScore: matchResult.genreScore,
        combinedScore: matchResult.combinedScore,
        likedOverlap: matchResult.likedOverlap,
        ratedOverlap: matchResult.ratedOverlap,
        watchedOverlap: matchResult.watchedOverlap,
        watchlistOverlap: matchResult.watchlistOverlap,
        sharedFilmsCount: matchResult.sharedFilms.length,
        sharedFilms: enrichedSharedFilms,
        sharedLikedCount: matchResult.sharedLikedFilms.length,
        sharedWatchedCount: matchResult.sharedWatchedFilms.length,
      },
      dateIdeas: dateIdeas.slice(0, 30),
      city: selectedCity,
      cities: DUTCH_CITIES,
    });
  } catch (error) {
    console.error('[Explore API] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';

    if (message.includes('not found') || message.includes('private')) {
      return NextResponse.json(
        { error: message, code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process match request', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
