import { NextResponse } from 'next/server';

// Dev-only endpoint: returns the latest magic link stored in memory.
// This is only available when NODE_ENV=development.
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const g = globalThis as unknown as Record<string, { email: string; url: string; ts: number } | undefined>;
  const link = g.__devMagicLink;
  if (!link || Date.now() - link.ts > 10 * 60 * 1000) {
    return NextResponse.json({ link: null });
  }
  return NextResponse.json({ link });
}
