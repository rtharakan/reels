import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

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
    pathname === '/' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check onboarding status
  if (pathname.startsWith('/onboarding')) {
    return NextResponse.next();
  }

  // For all other protected routes, check if onboarding is complete
  // We need to check the database for onboardingCompletedAt
  // For now, we trust the session exists and handle onboarding redirect in page components
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
