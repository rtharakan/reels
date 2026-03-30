/**
 * POST /api/buddy — Create a buddy request (auth required)
 * GET  /api/buddy — List open buddy requests (public, filterable by city)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { DUTCH_CITIES } from '@/server/services/explore-screenings';
import { headers } from 'next/headers';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 30, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const city = request.nextUrl.searchParams.get('city');
  const now = new Date();

  const where: Record<string, unknown> = {
    status: 'OPEN',
    expiresAt: { gt: now },
  };
  if (city && DUTCH_CITIES.some((c) => c.slug === city)) {
    where.city = city;
  }

  const requests = await prisma.buddyRequest.findMany({
    where,
    include: {
      creator: { select: { id: true, name: true, image: true } },
      interests: { select: { userId: true } },
    },
    orderBy: [{ date: 'asc' }, { time: 'asc' }],
    take: 50,
  });

  return NextResponse.json({ requests });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const body = await request.json();
  const { filmTitle, filmYear, posterUrl, cinemaName, city, date, time, ticketUrl, maxBuddies } = body as {
    filmTitle?: string;
    filmYear?: number;
    posterUrl?: string;
    cinemaName?: string;
    city?: string;
    date?: string;
    time?: string;
    ticketUrl?: string;
    maxBuddies?: number;
  };

  // Validation
  if (!filmTitle || typeof filmTitle !== 'string' || filmTitle.length > 200) {
    return NextResponse.json({ error: 'Valid film title required' }, { status: 400 });
  }
  if (!cinemaName || typeof cinemaName !== 'string' || cinemaName.length > 200) {
    return NextResponse.json({ error: 'Valid cinema name required' }, { status: 400 });
  }
  if (!city || !DUTCH_CITIES.some((c) => c.slug === city)) {
    return NextResponse.json({ error: 'Valid Dutch city required' }, { status: 400 });
  }
  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json({ error: 'Valid date required (YYYY-MM-DD)' }, { status: 400 });
  }
  if (!time || !TIME_REGEX.test(time)) {
    return NextResponse.json({ error: 'Valid time required (HH:MM)' }, { status: 400 });
  }

  // Date must be in the future
  const showDate = new Date(`${date}T${time}:00`);
  if (showDate <= new Date()) {
    return NextResponse.json({ error: 'Showtime must be in the future' }, { status: 400 });
  }

  const buddyLimit = Math.min(Math.max(maxBuddies ?? 1, 1), 20);

  const buddyRequest = await prisma.buddyRequest.create({
    data: {
      creatorId: session.user.id,
      filmTitle: filmTitle.trim(),
      filmYear: filmYear ?? null,
      posterUrl: posterUrl ?? null,
      cinemaName: cinemaName.trim(),
      city,
      date,
      time,
      ticketUrl: ticketUrl ?? null,
      maxBuddies: buddyLimit,
      expiresAt: showDate, // Expires at showtime
    },
    include: {
      creator: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json({ request: buddyRequest }, { status: 201 });
}
