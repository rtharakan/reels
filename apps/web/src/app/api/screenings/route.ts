/**
 * GET /api/screenings
 * Finds screenings of a film in a given city using Filmladder.
 * Query params: ?city=amsterdam&film=film-title&year=2026
 *
 * Uses fuzzy matching to handle English (TMDB) → Dutch (Filmladder) title mismatches.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchCityScreenings, DUTCH_CITIES } from '@/server/services/explore-screenings';
import { rateLimit } from '@/lib/rate-limit';

const PUNCTUATION_REGEX = /[^a-z0-9\s]/g;
const WHITESPACE_REGEX = /\s+/g;
const ARTICLES = ['the', 'a', 'an', 'de', 'het', 'een'];

function normalizeTitle(title: string): string {
  if (!title) return '';
  let n = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  for (const article of ARTICLES) {
    n = n.replace(new RegExp(`^${article}\\s+`, 'i'), '');
  }
  return n.replace(PUNCTUATION_REGEX, ' ').replace(WHITESPACE_REGEX, ' ').trim();
}

function tokenSetRatio(a: string, b: string): number {
  const tokensA = new Set(a.split(/\s+/).filter(Boolean));
  const tokensB = new Set(b.split(/\s+/).filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }
  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function fuzzyMatchTitle(queryTitle: string, screeningTitle: string): boolean {
  const normQuery = normalizeTitle(queryTitle);
  const normScreening = normalizeTitle(screeningTitle);

  // Exact match after normalization
  if (normQuery === normScreening) return true;

  // Substring containment (either direction)
  if (normQuery.includes(normScreening) || normScreening.includes(normQuery)) return true;

  // Token-set overlap: at least 50% shared words
  const ratio = tokenSetRatio(normQuery, normScreening);
  if (ratio >= 0.5) return true;

  // Check if all words of the shorter title are in the longer one (handles subtitle differences)
  const shorter = normQuery.length <= normScreening.length ? normQuery : normScreening;
  const longer = normQuery.length > normScreening.length ? normQuery : normScreening;
  const shorterTokens = shorter.split(/\s+/).filter(Boolean);
  if (shorterTokens.length >= 2 && shorterTokens.every((t) => longer.includes(t))) return true;

  return false;
}

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

    // If a film title filter is given, use fuzzy matching to handle English↔Dutch title mismatches
    if (filmTitle) {
      const filtered = screenings.filter((s) => fuzzyMatchTitle(filmTitle, s.filmTitle));
      return NextResponse.json({ screenings: filtered, city, filmTitle }, {
        headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
      });
    }

    return NextResponse.json({ screenings, city }, {
      headers: { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch screenings' }, { status: 500 });
  }
}
