/**
 * POST /api/plan
 * Fetches a user's Letterboxd watchlist and finds screenings in a given city.
 * Returns a 30-day calendar of when watchlist films are playing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { scrapeWatchlist } from '@reels/letterboxd-scraper';
import type { ExploreFilm } from '@/server/services/explore-scraper';
import { fetchCityScreenings, DUTCH_CITIES } from '@/server/services/explore-screenings';
import { findExploreMatchingScreenings } from '@/server/services/explore-film-matcher';
import { enrichFilmsWithPosters } from '@/server/services/tmdb';
import { rateLimit } from '@/lib/rate-limit';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,40}$/;

function extractUsername(input: string): string {
  const cleaned = input.trim();
  const urlMatch = cleaned.match(
    /(?:https?:\/\/)?(?:www\.)?letterboxd\.com\/([a-zA-Z0-9_-]+)/,
  );
  if (urlMatch?.[1]) return urlMatch[1];
  if (cleaned.startsWith('@')) return cleaned.slice(1);
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const rl = rateLimit(ip, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    const body = await request.json();
    const { username: rawUsername, city } = body as { username?: string; city?: string };

    if (!rawUsername) {
      return NextResponse.json({ error: 'Username is required', code: 'MISSING_USERNAME' }, { status: 400 });
    }

    const username = extractUsername(rawUsername);
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: 'Invalid username format', code: 'INVALID_USERNAME' }, { status: 400 });
    }

    const selectedCity = city && DUTCH_CITIES.some((c) => c.slug === city) ? city : 'amsterdam';

    // Scrape watchlist via HTML (RSS feeds don't include watchlist data)
    // and fetch city screenings in parallel
    const [scrapeResult, cityScreenings] = await Promise.all([
      scrapeWatchlist(username),
      fetchCityScreenings(selectedCity),
    ]);

    if (scrapeResult.isPrivate || scrapeResult.error) {
      return NextResponse.json(
        { error: scrapeResult.error ?? `${username}'s watchlist appears empty or private`, code: 'EMPTY_WATCHLIST' },
        { status: 200 },
      );
    }

    if (scrapeResult.films.length === 0) {
      return NextResponse.json(
        { error: `${username}'s watchlist appears empty or private`, code: 'EMPTY_WATCHLIST' },
        { status: 200 },
      );
    }

    // Convert scraped films to ExploreFilm format for the matcher.
    // The scraper embeds year in the title (e.g. "Sinners (2025)") — strip it
    // out so the fuzzy matcher can compare clean titles against Filmladder.
    const TITLE_YEAR_RE = /\s*\((\d{4})\)\s*$/;
    const watchlistFilms: ExploreFilm[] = scrapeResult.films.map((f) => {
      const yearMatch = f.title.match(TITLE_YEAR_RE);
      const title = yearMatch ? f.title.replace(TITLE_YEAR_RE, '').trim() : f.title;
      const year = yearMatch ? parseInt(yearMatch[1]!, 10) : undefined;
      return {
        letterboxdSlug: f.slug,
        title,
        year,
        letterboxdUrl: `https://letterboxd.com/film/${f.slug}/`,
      };
    });

    const watchlistData = {
      username,
      displayName: username,
      films: watchlistFilms,
      totalCount: scrapeResult.films.length,
    };

    // Match watchlist films against currently playing screenings
    const matched = findExploreMatchingScreenings(watchlistData.films, cityScreenings);

    // Enrich matched films with TMDB posters
    const matchedFilms = matched.map((m) => m.film);
    const enrichedFilms = await enrichFilmsWithPosters(matchedFilms);
    const enrichedMap = new Map(enrichedFilms.map((f) => [f.letterboxdSlug, f]));

    // Build calendar: group by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const calendarDays: {
      date: string;
      screenings: {
        filmTitle: string;
        filmSlug: string;
        posterUrl?: string;
        cinemaName: string;
        time: string;
        ticketUrl?: string;
      }[];
    }[] = [];

    // Generate 30-day calendar
    for (let d = 0; d < 30; d++) {
      const date = new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0]!;

      const dayScreenings = matched
        .filter((m) => m.screening.date === dateStr)
        .map((m) => {
          const enriched = enrichedMap.get(m.film.letterboxdSlug);
          return {
            filmTitle: m.film.title,
            filmSlug: m.film.letterboxdSlug,
            posterUrl: enriched?.posterUrl ?? m.film.posterUrl,
            cinemaName: m.screening.cinemaName,
            time: m.screening.time,
            ticketUrl: m.screening.ticketUrl,
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));

      calendarDays.push({ date: dateStr, screenings: dayScreenings });
    }

    return NextResponse.json(
      {
        username: watchlistData.username,
        displayName: watchlistData.displayName,
        watchlistSize: watchlistData.totalCount,
        city: selectedCity,
        cities: DUTCH_CITIES,
        totalMatches: matched.length,
        calendar: calendarDays,
      },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } },
    );
  } catch (error) {
    console.error('[Plan API] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found') || message.includes('private')) {
      return NextResponse.json({ error: message, code: 'USER_NOT_FOUND' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to generate plan', code: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
