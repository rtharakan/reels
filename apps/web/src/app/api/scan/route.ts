/**
 * POST /api/scan
 * Public endpoint — discovers Letterboxd profiles with similar film taste.
 * Uses the Scan Agent to crawl film fan pages and score profiles.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runScanAgent } from '@/server/services/scan-agent';
import { rateLimit } from '@/lib/rate-limit';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,40}$/;

function extractUsername(input: string): string {
  const cleaned = input.trim();
  const urlMatch = cleaned.match(
    /(?:https?:\/\/)?(?:www\.)?letterboxd\.com\/([a-zA-Z0-9_-]+)/,
  );
  if (urlMatch?.[1]) return urlMatch[1];
  if (cleaned.startsWith('@')) return cleaned.slice(1);
  return cleaned;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per 10 minutes per IP (scan is expensive)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      'unknown';
    const rl = rateLimit(ip, 5, 600_000);
    if (!rl.allowed) {
      return NextResponse.json(
        {
          error: 'Too many scan requests. Please try again later.',
          code: 'RATE_LIMITED',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(
              Math.ceil((rl.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const body = await request.json();
    const { username: rawUsername, depth } = body as {
      username?: string;
      depth?: 'quick' | 'standard' | 'deep';
    };

    if (!rawUsername) {
      return NextResponse.json(
        { error: 'Username is required', code: 'MISSING_USERNAME' },
        { status: 400 },
      );
    }

    const username = extractUsername(rawUsername);
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { error: 'Invalid username format', code: 'INVALID_USERNAME' },
        { status: 400 },
      );
    }

    // Configure scan depth
    const depthConfig = {
      quick: { maxFilmsToScan: 4, maxProfilesToScore: 10 },
      standard: { maxFilmsToScan: 8, maxProfilesToScore: 20 },
      deep: { maxFilmsToScan: 15, maxProfilesToScore: 40 },
    };
    const config = depthConfig[depth ?? 'standard'];

    const results = await runScanAgent(username, config);

    return NextResponse.json({
      username,
      results,
      totalFound: results.length,
      depth: depth ?? 'standard',
    });
  } catch (error) {
    console.error('[Scan API] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    if (
      message.includes('not found') ||
      message.includes('private') ||
      message.includes('empty')
    ) {
      return NextResponse.json(
        { error: message, code: 'USER_NOT_FOUND' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to complete scan', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}
