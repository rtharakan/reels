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
import { enrichFilmsWithPosters } from '@/server/services/tmdb';
import { rateLimit } from '@/lib/rate-limit';

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

    if (data1.watched.length === 0 && data1.liked.length === 0) {
      return NextResponse.json(
        {
          error: `${user1}'s Letterboxd profile appears empty. Make sure they have logged some films on Letterboxd and their profile is public.`,
          code: 'EMPTY_WATCHLIST_1',
        },
        { status: 200 }
      );
    }

    if (data2.watched.length === 0 && data2.liked.length === 0) {
      return NextResponse.json(
        {
          error: `${user2}'s Letterboxd profile appears empty. Make sure they have logged some films on Letterboxd and their profile is public.`,
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
        highRated: data1.highRated,
      },
      {
        watchlist: data2.watchlist.films,
        watched: data2.watched,
        liked: data2.liked,
        highRated: data2.highRated,
      },
    );

    // Enrich shared films with TMDB posters for missing poster URLs
    const enrichedSharedFilms = await enrichFilmsWithPosters(matchResult.sharedFilms);

    // If a city is provided, find screenings of shared films
    let dateIdeas: {
      filmTitle: string;
      cinemaName: string;
      date: string;
      time: string;
      ticketUrl?: string;
    }[] = [];
    let dateIdeasSource: 'watchlist' | 'interests' = 'watchlist';

    const selectedCity = city && DUTCH_CITIES.some((c) => c.slug === city) ? city : null;

    if (selectedCity) {
      try {
        const screenings = await fetchCityScreenings(selectedCity);

        if (matchResult.sharedFilms.length > 0) {
          // Primary: match shared watchlist films against cinema screenings
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
        }

        // Fallback: when no watchlist matches, recommend based on combined interests
        // Use liked + watched films as interest signals
        if (dateIdeas.length === 0) {
          dateIdeasSource = 'interests';
          const interestFilms = [
            ...matchResult.sharedLikedFilms,
            ...matchResult.sharedWatchedFilms,
            ...matchResult.sharedFilms,
          ];
          if (interestFilms.length > 0) {
            const matched = findExploreMatchingScreenings(interestFilms, screenings);
            dateIdeas = matched.map((m) => ({
              filmTitle: m.film.title,
              cinemaName: m.screening.cinemaName,
              date: m.screening.date,
              time: m.screening.time,
              ticketUrl: m.screening.ticketUrl,
            }));
          }

          // Final fallback: just show what's playing (any genre overlap with combined viewed films)
          if (dateIdeas.length === 0 && screenings.length > 0) {
            const uniqueScreenings = new Map<string, typeof screenings[0]>();
            for (const s of screenings) {
              const key = `${s.filmTitle}::${s.date}::${s.time}::${s.cinemaName}`;
              if (!uniqueScreenings.has(key)) uniqueScreenings.set(key, s);
            }
            dateIdeas = Array.from(uniqueScreenings.values())
              .slice(0, 30)
              .map((s) => ({
                filmTitle: s.filmTitle,
                cinemaName: s.cinemaName,
                date: s.date,
                time: s.time,
                ticketUrl: s.ticketUrl,
              }));
          }
        }
      } catch (err) {
        console.error('[Explore] Failed to fetch screenings:', err);
        // Non-fatal — we still return the match result
      }
    }

    return NextResponse.json({
      user1: {
        username: data1.watchlist.username,
        displayName: data1.watchlist.displayName,
        filmCount: data1.watched.length,
      },
      user2: {
        username: data2.watchlist.username,
        displayName: data2.watchlist.displayName,
        filmCount: data2.watched.length,
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
      dateIdeasSource,
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
