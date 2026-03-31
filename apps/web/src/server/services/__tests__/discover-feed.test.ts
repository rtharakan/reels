import { describe, it, expect, vi } from 'vitest';
import { getDiscoverFeed } from '../discover-feed';

function createMockPrisma(opts: {
  timezone?: string;
  intent?: string;
  cardCount?: number;
  seenUserIds?: string[];
  blocks?: { blockerId: string; blockedUserId: string }[];
  candidates?: {
    candidateId: string;
    totalScore: number;
    sharedFilmIds: string[];
    candidate: {
      id: string;
      name: string;
      age: number | null;
      location: string | null;
      bio: string | null;
      intent: string | null;
      profilePhotos: string[];
      prompts: unknown;
      topFilmIds: string[];
    };
  }[];
  films?: { id: string; tmdbId: number | null; title: string; year: number | null; posterPath: string | null; genreIds: number[] }[];
}) {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        timezone: opts.timezone ?? 'UTC',
        intent: opts.intent ?? 'BOTH',
      }),
    },
    dailyAllocation: {
      findUnique: vi.fn().mockResolvedValue(
        opts.cardCount !== undefined ? { cardCount: opts.cardCount } : null,
      ),
    },
    seenUser: {
      findMany: vi.fn().mockResolvedValue(
        (opts.seenUserIds ?? []).map((id) => ({ seenUserId: id })),
      ),
    },
    block: {
      findMany: vi.fn().mockResolvedValue(opts.blocks ?? []),
    },
    matchScore: {
      findMany: vi.fn().mockResolvedValue(opts.candidates ?? []),
    },
    film: {
      findMany: vi.fn().mockResolvedValue(opts.films ?? []),
    },
  } as any;
}

describe('getDiscoverFeed', () => {
  it('returns empty feed when daily limit reached', async () => {
    const prisma = createMockPrisma({ cardCount: 10 });
    const result = await getDiscoverFeed(prisma, 'user-1');

    expect(result.cards).toEqual([]);
    expect(result.remainingToday).toBe(0);
    expect(result.isAllCaughtUp).toBe(true);
  });

  it('returns empty feed when no candidates exist', async () => {
    const prisma = createMockPrisma({ cardCount: 0, candidates: [] });
    const result = await getDiscoverFeed(prisma, 'user-1');

    expect(result.cards).toEqual([]);
    expect(result.isAllCaughtUp).toBe(true);
  });

  it('returns candidates sorted by score', async () => {
    const prisma = createMockPrisma({
      cardCount: 0,
      candidates: [
        {
          candidateId: 'c1',
          totalScore: 0.8,
          sharedFilmIds: ['film-1'],
          candidate: {
            id: 'c1', name: 'Alice', age: 25, location: 'NYC',
            bio: 'Film lover', intent: 'BOTH', profilePhotos: [],
            prompts: [], topFilmIds: [],
          },
        },
      ],
      films: [],
    });
    const result = await getDiscoverFeed(prisma, 'user-1');

    expect(result.cards.length).toBe(1);
    expect(result.cards[0]!.userId).toBe('c1');
    expect(result.cards[0]!.name).toBe('Alice');
    expect(result.cards[0]!.matchScore).toBe(0.8);
  });

  it('excludes seen users from candidates query', async () => {
    const prisma = createMockPrisma({
      cardCount: 0,
      seenUserIds: ['seen-1', 'seen-2'],
      candidates: [],
    });
    await getDiscoverFeed(prisma, 'user-1');

    const findManyCall = prisma.matchScore.findMany.mock.calls[0][0];
    expect(findManyCall.where.candidateId.notIn).toContain('seen-1');
    expect(findManyCall.where.candidateId.notIn).toContain('seen-2');
  });

  it('excludes blocked users from candidates query', async () => {
    const prisma = createMockPrisma({
      cardCount: 0,
      blocks: [{ blockerId: 'user-1', blockedUserId: 'blocked-1' }],
      candidates: [],
    });
    await getDiscoverFeed(prisma, 'user-1');

    const findManyCall = prisma.matchScore.findMany.mock.calls[0][0];
    expect(findManyCall.where.candidateId.notIn).toContain('blocked-1');
  });

  it('excludes self from candidates query', async () => {
    const prisma = createMockPrisma({ cardCount: 0, candidates: [] });
    await getDiscoverFeed(prisma, 'user-1');

    const findManyCall = prisma.matchScore.findMany.mock.calls[0][0];
    expect(findManyCall.where.candidateId.notIn).toContain('user-1');
  });

  it('calculates remaining cards correctly', async () => {
    const prisma = createMockPrisma({
      cardCount: 3,
      candidates: [
        {
          candidateId: 'c1',
          totalScore: 0.5,
          sharedFilmIds: [],
          candidate: {
            id: 'c1', name: 'Bob', age: 30, location: null,
            bio: null, intent: null, profilePhotos: [],
            prompts: null, topFilmIds: [],
          },
        },
      ],
      films: [],
    });
    const result = await getDiscoverFeed(prisma, 'user-1');

    // 10 max - 3 used = 7 remaining, minus 1 returned = 6
    expect(result.remainingToday).toBe(6);
  });

  it('handles null allocation (first visit of the day)', async () => {
    const prisma = createMockPrisma({
      cardCount: undefined,
      candidates: [],
    });
    const result = await getDiscoverFeed(prisma, 'user-1');

    expect(result.remainingToday).toBe(10);
  });
});
