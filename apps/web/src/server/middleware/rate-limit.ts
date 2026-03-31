import { rateLimit } from '@/lib/rate-limit';
import type { NextRequest } from 'next/server';

/**
 * Pre-configured rate limits for specific endpoints per spec NFR-001.
 * Uses the in-memory rate limiter from @/lib/rate-limit.
 */

/** Auth endpoints: 10 requests/min per IP */
export function rateLimitAuth(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return rateLimit(`auth:${ip}`, 10, 60_000);
}

/** Watchlist import: 5 requests/hour per user */
export function rateLimitWatchlistImport(userId: string) {
  return rateLimit(`watchlist-import:${userId}`, 5, 3_600_000);
}

/** Discover actions (interest/skip): 30 requests/min per user */
export function rateLimitDiscoverAction(userId: string) {
  return rateLimit(`discover-action:${userId}`, 30, 60_000);
}

/** General API: 100 requests/min per IP */
export function rateLimitGeneral(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  return rateLimit(`general:${ip}`, 100, 60_000);
}

/**
 * Helper to create a rate-limit exceeded response with standard headers.
 */
export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please try again later.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
        'X-RateLimit-Reset': String(resetAt),
      },
    },
  );
}
