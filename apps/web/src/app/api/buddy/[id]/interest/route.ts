/**
 * POST /api/buddy/[id]/interest — Express interest in a buddy request (auth required)
 * DELETE /api/buddy/[id]/interest — Remove interest
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 20, 60_000);
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

  const buddyRequest = await prisma.buddyRequest.findUnique({
    where: { id },
    include: { interests: true },
  });

  if (!buddyRequest) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  if (buddyRequest.status !== 'OPEN') {
    return NextResponse.json({ error: 'This request is no longer open' }, { status: 400 });
  }

  if (buddyRequest.creatorId === session.user.id) {
    return NextResponse.json({ error: 'Cannot join your own request' }, { status: 400 });
  }

  if (buddyRequest.interests.length >= buddyRequest.maxBuddies) {
    return NextResponse.json({ error: 'This request is full' }, { status: 400 });
  }

  const existing = buddyRequest.interests.find((i) => i.userId === session.user.id);
  if (existing) {
    return NextResponse.json({ error: 'Already interested' }, { status: 409 });
  }

  const interest = await prisma.buddyInterest.create({
    data: {
      requestId: id,
      userId: session.user.id,
    },
  });

  // Auto-close if limit reached
  if (buddyRequest.interests.length + 1 >= buddyRequest.maxBuddies) {
    await prisma.buddyRequest.update({
      where: { id },
      data: { status: 'FULL' },
    });
  }

  return NextResponse.json({ interest }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const rl = rateLimit(ip, 20, 60_000);
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

  const deleted = await prisma.buddyInterest.deleteMany({
    where: { requestId: id, userId: session.user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Re-open if was full
  await prisma.buddyRequest.updateMany({
    where: { id, status: 'FULL' },
    data: { status: 'OPEN' },
  });

  return NextResponse.json({ success: true });
}
