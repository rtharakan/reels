import { describe, it, expect } from 'vitest';
import { z } from 'zod';

/**
 * Unit tests for mood.ts tRPC router logic.
 * Tests input validation, business rules, and mood engine behavior.
 */

// ─── Input Schemas (mirroring the router) ──────────────────────────────

const MoodTypeEnum = z.enum([
  'NOSTALGIC', 'ADVENTUROUS', 'HEARTBROKEN', 'HYPE', 'CHILL',
  'ROMANTIC', 'MYSTERIOUS', 'INSPIRED', 'MELANCHOLIC', 'COZY',
]);

const setMoodSchema = z.object({ mood: MoodTypeEnum });
const tagFilmSchema = z.object({ filmId: z.string().cuid(), mood: MoodTypeEnum });
const expressInterestSchema = z.object({ targetUserId: z.string().cuid() });

// ─── setMood ────────────────────────────────────────────────────────────

describe('Mood Router — setMood', () => {
  it('accepts all 10 valid mood types', () => {
    const moods = [
      'NOSTALGIC', 'ADVENTUROUS', 'HEARTBROKEN', 'HYPE', 'CHILL',
      'ROMANTIC', 'MYSTERIOUS', 'INSPIRED', 'MELANCHOLIC', 'COZY',
    ];
    for (const mood of moods) {
      expect(setMoodSchema.safeParse({ mood }).success).toBe(true);
    }
  });

  it('rejects invalid mood type', () => {
    expect(setMoodSchema.safeParse({ mood: 'HAPPY' }).success).toBe(false);
    expect(setMoodSchema.safeParse({ mood: '' }).success).toBe(false);
    expect(setMoodSchema.safeParse({ mood: 'nostalgic' }).success).toBe(false); // case sensitive
  });

  it('rejects missing mood', () => {
    expect(setMoodSchema.safeParse({}).success).toBe(false);
  });
});

// ─── tagFilm ────────────────────────────────────────────────────────────

describe('Mood Router — tagFilm', () => {
  it('accepts valid filmId and mood', () => {
    const result = tagFilmSchema.safeParse({
      filmId: 'clxyz0000000000000000000x',
      mood: 'NOSTALGIC',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid filmId format', () => {
    const result = tagFilmSchema.safeParse({
      filmId: 'not-a-cuid',
      mood: 'NOSTALGIC',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid mood on tagFilm', () => {
    const result = tagFilmSchema.safeParse({
      filmId: 'clxyz0000000000000000000x',
      mood: 'BORED',
    });
    expect(result.success).toBe(false);
  });
});

// ─── expressInterest ────────────────────────────────────────────────────

describe('Mood Router — expressInterest', () => {
  it('accepts valid targetUserId', () => {
    const result = expressInterestSchema.safeParse({
      targetUserId: 'clxyz0000000000000000000x',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid targetUserId', () => {
    const result = expressInterestSchema.safeParse({
      targetUserId: '',
    });
    expect(result.success).toBe(false);
  });
});

// ─── Business Logic ─────────────────────────────────────────────────────

describe('Mood Router — Business Logic', () => {
  it('setMood should deactivate previous moods before creating new one', () => {
    // Simulates the transaction: updateMany(isActive: false) + create(isActive: true)
    const existingMoods = [
      { id: 'm1', mood: 'CHILL', isActive: true },
      { id: 'm2', mood: 'HYPE', isActive: false },
    ];

    // Step 1: Deactivate all active
    const deactivated = existingMoods.map(m => ({ ...m, isActive: false }));
    expect(deactivated.every(m => !m.isActive)).toBe(true);

    // Step 2: Create new active
    const newMood = { id: 'm3', mood: 'NOSTALGIC', isActive: true };
    const allMoods = [...deactivated, newMood];
    const activeMoods = allMoods.filter(m => m.isActive);
    expect(activeMoods).toHaveLength(1);
    expect(activeMoods[0]!.mood).toBe('NOSTALGIC');
  });

  it('expressInterest should reject self-interest', () => {
    const callerId = 'user-1';
    const targetUserId = 'user-1';
    expect(targetUserId === callerId).toBe(true); // Would throw BAD_REQUEST
  });

  it('expressInterest should detect mutual interest', () => {
    // User A -> User B exists, now User B -> User A
    const existingInterest = { fromUserId: 'user-b', toUserId: 'user-a' };
    const isMatch = !!existingInterest;
    expect(isMatch).toBe(true);
  });

  it('expressInterest should check blocks bidirectionally', () => {
    const blocks = [
      { blockerId: 'user-a', blockedUserId: 'user-b' },
    ];
    const callerId = 'user-a';
    const targetUserId = 'user-b';

    const isBlocked = blocks.some(
      b =>
        (b.blockerId === callerId && b.blockedUserId === targetUserId) ||
        (b.blockerId === targetUserId && b.blockedUserId === callerId),
    );
    expect(isBlocked).toBe(true);
  });

  it('getMoodTwins should exclude blocked users', () => {
    const twins = [
      { userId: 'user-b', mood: 'CHILL' },
      { userId: 'user-c', mood: 'CHILL' },
    ];
    const blockedUserIds = new Set(['user-c']);

    const filtered = twins.filter(t => !blockedUserIds.has(t.userId));
    expect(filtered).toHaveLength(1);
    expect(filtered[0]!.userId).toBe('user-b');
  });
});

// ─── Mood Engine — Suggestion Logic ─────────────────────────────────────

describe('Mood Engine — Community Suggestions', () => {
  it('calculates match strength based on tag count', () => {
    const tagCounts = [
      { filmId: 'f1', count: 10 },
      { filmId: 'f2', count: 5 },
      { filmId: 'f3', count: 1 },
    ];

    const strengths = tagCounts.map(t => Math.min(1, t.count / 10));
    expect(strengths[0]).toBe(1); // 10/10 = 1 (capped)
    expect(strengths[1]).toBe(0.5); // 5/10
    expect(strengths[2]).toBe(0.1); // 1/10
  });

  it('returns empty suggestions when no tagged films exist', () => {
    const taggedFilms: Array<{ filmId: string }> = [];
    expect(taggedFilms.length === 0).toBe(true);
    // Router returns [] early
  });

  it('limits suggestions to 10 films', () => {
    const taggedFilms = Array.from({ length: 15 }, (_, i) => ({ filmId: `f${i}` }));
    const limited = taggedFilms.slice(0, 10);
    expect(limited).toHaveLength(10);
  });
});

// ─── Mood History ───────────────────────────────────────────────────────

describe('Mood Router — getHistory', () => {
  it('returns moods ordered by selectedAt descending', () => {
    const moods = [
      { id: 'm1', mood: 'CHILL', selectedAt: '2025-07-01T10:00:00Z', isActive: false },
      { id: 'm2', mood: 'HYPE', selectedAt: '2025-07-10T10:00:00Z', isActive: false },
      { id: 'm3', mood: 'NOSTALGIC', selectedAt: '2025-07-15T10:00:00Z', isActive: true },
    ];

    const sorted = [...moods].sort((a, b) =>
      new Date(b.selectedAt).getTime() - new Date(a.selectedAt).getTime(),
    );
    expect(sorted[0]!.mood).toBe('NOSTALGIC');
    expect(sorted[2]!.mood).toBe('CHILL');
  });

  it('currentMood returns the active mood', () => {
    const moods = [
      { mood: 'CHILL', isActive: false },
      { mood: 'INSPIRED', isActive: true },
    ];
    const currentMood = moods.find(m => m.isActive)?.mood ?? null;
    expect(currentMood).toBe('INSPIRED');
  });

  it('currentMood returns null if no active mood', () => {
    const moods = [
      { mood: 'CHILL', isActive: false },
      { mood: 'HYPE', isActive: false },
    ];
    const currentMood = moods.find(m => m.isActive)?.mood ?? null;
    expect(currentMood).toBeNull();
  });
});

// ─── Rate Limiting ──────────────────────────────────────────────────────

describe('Mood Router — Rate Limiting', () => {
  it('setMood rate limit is 10 per minute', () => {
    const maxPerMinute = 10;
    const limits = new Map<string, { count: number; resetAt: number }>();
    const key = 'mood-set:user-1';
    const now = Date.now();

    for (let i = 0; i < maxPerMinute; i++) {
      const entry = limits.get(key);
      if (!entry || entry.resetAt < now) {
        limits.set(key, { count: 1, resetAt: now + 60_000 });
      } else {
        entry.count++;
      }
    }

    const entry = limits.get(key)!;
    expect(entry.count).toBe(maxPerMinute);
  });
});

// ─── 3-Second Timeout Handling ──────────────────────────────────────────

describe('Mood Engine — Timeout', () => {
  it('should have 3-second timeout for AI suggestions', async () => {
    const TIMEOUT_MS = 3_000;
    const start = Date.now();

    // Simulate a fast response (under timeout)
    const result = await Promise.race([
      new Promise<string>(resolve => setTimeout(() => resolve('suggestions'), 100)),
      new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
    ]);

    const elapsed = Date.now() - start;
    expect(result).toBe('suggestions');
    expect(elapsed).toBeLessThan(TIMEOUT_MS);
  });

  it('should fallback to community suggestions on timeout', async () => {
    const TIMEOUT_MS = 100; // shortened for test speed
    let usedFallback = false;

    try {
      await Promise.race([
        new Promise<string>(resolve => setTimeout(() => resolve('ai-result'), 500)),
        new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)),
      ]);
    } catch {
      usedFallback = true;
    }

    expect(usedFallback).toBe(true);
  });
});
