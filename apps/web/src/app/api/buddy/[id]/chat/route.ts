/**
 * GET  /api/buddy/[id]/chat — Get chat messages (auth required, participants only)
 * POST /api/buddy/[id]/chat — Send a message (auth required, participants only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

async function isParticipant(requestId: string, userId: string): Promise<boolean> {
  const buddyRequest = await prisma.buddyRequest.findUnique({
    where: { id: requestId },
    include: { interests: { select: { userId: true } } },
  });
  if (!buddyRequest) return false;
  if (buddyRequest.creatorId === userId) return true;
  return buddyRequest.interests.some((i) => i.userId === userId);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 30, 60_000);
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

  const { id } = await params;

  if (!(await isParticipant(id, session.user.id))) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const after = request.nextUrl.searchParams.get('after');

  const messages = await prisma.buddyMessage.findMany({
    where: {
      requestId: id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    include: { sender: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: 'asc' },
    take: 100,
  });

  return NextResponse.json({ messages });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 30, 60_000);
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

  const { id } = await params;

  if (!(await isParticipant(id, session.user.id))) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const body = await request.json();
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!content || content.length > 2000) {
    return NextResponse.json({ error: 'Message must be 1-2000 characters' }, { status: 400 });
  }

  const message = await prisma.buddyMessage.create({
    data: {
      requestId: id,
      senderId: session.user.id,
      content,
    },
    include: { sender: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}
