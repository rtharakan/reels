/**
 * POST /api/explore/match
 * Public endpoint — no authentication required.
 * Accepts two Letterboxd usernames, scrapes watchlists, computes match,
 * and optionally finds shared films playing in a Dutch city.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchExploreWatchlist } from '@/server/services/explore-scraper';
import { computeExploreMatch } from '@/server/services/explore-matcher';
import { fetchCityScreenings, DUTCH_CITIES } from '@/server/services/explore-screenings';
import { findExploreMatchingScreenings } from '@/server/services/explore-film-matcher';
import type { ExploreFilm } from '@/server/services/explore-scraper';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';

async function resolveTMDBPoster(
  title: string,
  year: number | undefined,
  apiToken: string,
): Promise<string | null> {
  const params = new URLSearchParams({ query: title });
  if (year) params.set('primary_release_year', String(year));

  const res = await fetch(`${TMDB_API_BASE}/search/movie?${params}`, {
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const movie = data.results?.[0];
  if (!movie?.poster_path) return null;

  return `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
}

async function enrichPostersWithTMDB(
  films: ExploreFilm[],
): Promise<ExploreFilm[]> {
  const apiToken = process.env.TMDB_API_TOKEN;
  if (!apiToken) return films;

  const enriched = await Promise.all(
    films.map(async (film) => {
      if (film.posterUrl) return film;
      try {
        const posterUrl = await resolveTMDBPoster(film.title, film.year, apiToken);
        return posterUrl ? { ...film, posterUrl } : film;
      } catch {
        return film;
      }
    }),
  );

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

    // Fetch both watchlists in parallel
    const [watchlist1, watchlist2] = await Promise.all([
      fetchExploreWatchlist(user1),
      fetchExploreWatchlist(user2),
    ]);

    if (watchlist1.films.length === 0) {
      return NextResponse.json(
        {
          error: `${user1}'s watchlist is empty or private`,
          code: 'EMPTY_WATCHLIST_1',
        },
        { status: 200 }
      );
    }

    if (watchlist2.films.length === 0) {
      return NextResponse.json(
        {
          error: `${user2}'s watchlist is empty or private`,
          code: 'EMPTY_WATCHLIST_2',
        },
        { status: 200 }
      );
    }

    // Compute match
    const matchResult = computeExploreMatch(watchlist1.films, watchlist2.films);

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
        username: watchlist1.username,
        displayName: watchlist1.displayName,
        filmCount: watchlist1.totalCount,
      },
      user2: {
        username: watchlist2.username,
        displayName: watchlist2.displayName,
        filmCount: watchlist2.totalCount,
      },
      match: {
        overlapScore: matchResult.overlapScore,
        genreScore: matchResult.genreScore,
        combinedScore: matchResult.combinedScore,
        sharedFilmsCount: matchResult.sharedFilms.length,
        sharedFilms: enrichedSharedFilms,
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
