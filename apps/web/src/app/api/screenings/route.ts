/**
 * GET /api/screenings
 * Finds screenings of a film in a given city using Filmladder.
 * Query params: ?city=amsterdam&film=film-title&year=2026
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCityScreenings, DUTCH_CITIES } from '@/server/services/explore-screenings';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const city = request.nextUrl.searchParams.get('city') || 'amsterdam';
  const filmTitle = request.nextUrl.searchParams.get('film');

  if (!DUTCH_CITIES.some((c) => c.slug === city)) {
    return NextResponse.json({ error: 'Unsupported city' }, { status: 400 });
  }

  try {
    const screenings = await fetchCityScreenings(city);

    // If a film title filter is given, filter to matching screenings
    if (filmTitle) {
      const normalized = filmTitle.toLowerCase().trim();
      const filtered = screenings.filter(
        (s) => s.filmTitle.toLowerCase().includes(normalized) || normalized.includes(s.filmTitle.toLowerCase()),
      );
      return NextResponse.json({ screenings: filtered, city, filmTitle }, {
        headers: { 'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600' },
      });
    }

    return NextResponse.json({ screenings, city }, {
      headers: { 'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch screenings' }, { status: 500 });
  }
}
