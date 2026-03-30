/**
 * GET /api/now-playing
 * Returns currently playing films in a region (default: NL) with TMDB posters.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchNowPlaying } from '@/server/services/tmdb';

export async function GET(request: NextRequest) {
  const region = request.nextUrl.searchParams.get('region') || 'NL';

  try {
    const films = await fetchNowPlaying(region, 1);
    return NextResponse.json({ films, region }, {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch now-playing films' }, { status: 500 });
  }
}
