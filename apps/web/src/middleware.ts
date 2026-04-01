import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lightweight middleware — only checks for session cookie presence.
// Full session validation happens server-side in API routes / server components.
// This avoids importing the heavy auth + Prisma stack into the Edge Function
// (which would exceed Vercel's 1 MB Edge Function size limit).

const SESSION_COOKIE = 'reels.session_token';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — API routes are excluded because:
  // - Public APIs (explore, scan, plan, screenings, now-playing) have their own rate limiting
  // - tRPC routes (/api/trpc/*) enforce auth via protectedProcedure/onboardedProcedure
  // - Auth routes (/api/auth/*) must be public for login/signup flow
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/privacy') ||
    pathname.startsWith('/terms') ||
    pathname.startsWith('/explore') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/scan') ||
    pathname.startsWith('/plan') ||
    pathname.startsWith('/buddy') ||
    pathname.startsWith('/help') ||
    pathname.startsWith('/features') ||
    pathname === '/' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  if (!sessionCookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
