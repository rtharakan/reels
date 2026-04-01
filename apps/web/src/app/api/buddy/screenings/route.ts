/**
 * GET /api/buddy/screenings?city=amsterdam&date=2026-03-30
 * Returns available films and theaters for a given city and date.
 * Used by the Buddy feature to populate form dropdowns.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCityScreenings, DUTCH_CITIES } from '@/server/services/explore-screenings';
import { resolveTMDBPoster } from '@/server/services/tmdb';
import { rateLimit } from '@/lib/rate-limit';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 20, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const city = request.nextUrl.searchParams.get('city') || 'amsterdam';
  const date = request.nextUrl.searchParams.get('date');

  if (!DUTCH_CITIES.some((c) => c.slug === city)) {
    return NextResponse.json({ error: 'Unsupported city' }, { status: 400 });
  }

  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json({ error: 'Valid date required (YYYY-MM-DD)' }, { status: 400 });
  }

  try {
    const allScreenings = await fetchCityScreenings(city);

    // Filter to the selected date
    const dayScreenings = allScreenings.filter((s) => s.date === date);

    // Extract unique cinemas
    const cinemas = [...new Set(dayScreenings.map((s) => s.cinemaName))].sort();

    // Group films with their showtimes and cinemas
    const filmMap = new Map<
      string,
      {
        title: string;
        year?: number;
        shows: { cinema: string; time: string; ticketUrl?: string }[];
      }
    >();

    for (const s of dayScreenings) {
      const key = s.filmTitle.toLowerCase().trim();
      const existing = filmMap.get(key);
      if (existing) {
        existing.shows.push({ cinema: s.cinemaName, time: s.time, ticketUrl: s.ticketUrl });
      } else {
        filmMap.set(key, {
          title: s.filmTitle,
          year: s.filmYear,
          shows: [{ cinema: s.cinemaName, time: s.time, ticketUrl: s.ticketUrl }],
        });
      }
    }

    // Resolve posters for top films
    const filmsList = [...filmMap.values()].sort((a, b) => b.shows.length - a.shows.length);
    const filmsWithPosters = await Promise.all(
      filmsList.slice(0, 40).map(async (f) => ({
        ...f,
        posterUrl: await resolveTMDBPoster(f.title, f.year),
      })),
    );

    // Available dates in the dataset (for date picker guidance)
    const availableDates = [...new Set(allScreenings.map((s) => s.date))].sort();

    return NextResponse.json(
      { films: filmsWithPosters, cinemas, date, city, availableDates },
      { headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' } },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch screenings' }, { status: 500 });
  }
}
