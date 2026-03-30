/**
 * GET /api/now-playing
 * Returns currently playing films in a region (default: NL) with TMDB posters.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchNowPlaying } from '@/server/services/tmdb';
import { rateLimit } from '@/lib/rate-limit';

const VALID_REGION = /^[A-Z]{2}$/;

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const regionParam = request.nextUrl.searchParams.get('region') || 'NL';
  const region = VALID_REGION.test(regionParam) ? regionParam : 'NL';

  try {
    const films = await fetchNowPlaying(region, 1);
    return NextResponse.json({ films, region }, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch now-playing films' }, { status: 500 });
  }
}
