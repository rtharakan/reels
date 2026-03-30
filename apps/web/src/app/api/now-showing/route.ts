/**
 * GET /api/now-showing?city=amsterdam
 * Returns films actually showing in a Dutch city with TMDB posters + screenings.
 * Unlike /api/now-playing (TMDB-based), this uses Filmladder (real cinema data).
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCityScreenings, DUTCH_CITIES } from '@/server/services/explore-screenings';
import { resolveTMDBPoster } from '@/server/services/tmdb';
import { rateLimit } from '@/lib/rate-limit';

interface NowShowingFilm {
  id: string;
  title: string;
  year?: number;
  posterUrl: string;
  screeningCount: number;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 15, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const city = request.nextUrl.searchParams.get('city') || 'amsterdam';
  if (!DUTCH_CITIES.some((c) => c.slug === city)) {
    return NextResponse.json({ error: 'Unsupported city' }, { status: 400 });
  }

  try {
    const screenings = await fetchCityScreenings(city);

    // Extract unique films from screenings
    const filmMap = new Map<string, { title: string; year?: number; count: number }>();
    for (const s of screenings) {
      const key = s.filmTitle.toLowerCase().trim();
      const existing = filmMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        filmMap.set(key, { title: s.filmTitle, year: s.filmYear, count: 1 });
      }
    }

    // Sort by screening count (most popular first), limit to top 30
    const sortedFilms = [...filmMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);

    // Resolve TMDB posters in batches
    const BATCH_SIZE = 8;
    const films: NowShowingFilm[] = [];

    for (let i = 0; i < sortedFilms.length; i += BATCH_SIZE) {
      const batch = sortedFilms.slice(i, i + BATCH_SIZE);
      const resolved = await Promise.all(
        batch.map(async (f) => {
          const posterUrl = await resolveTMDBPoster(f.title, f.year);
          return {
            id: f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            title: f.title,
            year: f.year,
            posterUrl: posterUrl ?? '',
            screeningCount: f.count,
          };
        }),
      );
      films.push(...resolved);
    }

    return NextResponse.json(
      { films, screenings, city },
      { headers: { 'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600' } },
    );
  } catch {
    return NextResponse.json({ error: 'Failed to fetch now-showing films' }, { status: 500 });
  }
}
