import { describe, it, expect } from 'vitest';
import { createMatchIfMutual } from '../match-creation';

// Minimal mock PrismaClient
function createMockPrisma(opts: {
  hasReciprocal: boolean;
  existingMatch?: { id: string };
  matchScore?: { totalScore: number; sharedFilmIds: string[] };
}) {
  const createdMatch = { id: 'match-123', userAId: '', userBId: '', score: 0, sharedFilmIds: [] as string[] };

  return {
    interest: {
      findUnique: async () => (opts.hasReciprocal ? { id: 'interest-1' } : null),
    },
    match: {
      upsert: async ({ create }: any) => {
        return opts.existingMatch ?? { ...createdMatch, ...create };
      },
    },
    matchScore: {
      findUnique: async () =>
        opts.matchScore ?? null,
    },
  } as any;
}

describe('createMatchIfMutual', () => {
  it('returns no match when there is no reciprocal interest', async () => {
    const prisma = createMockPrisma({ hasReciprocal: false });
    const result = await createMatchIfMutual(prisma, 'user-a', 'user-b');

    expect(result.isMatch).toBe(false);
    expect(result.matchId).toBeNull();
  });

  it('creates a match when reciprocal interest exists', async () => {
    const prisma = createMockPrisma({
      hasReciprocal: true,
      matchScore: { totalScore: 0.85, sharedFilmIds: ['film-1', 'film-2'] },
    });
    const result = await createMatchIfMutual(prisma, 'user-a', 'user-b');

    expect(result.isMatch).toBe(true);
    expect(result.matchId).toBeTruthy();
  });

  it('uses match score data when available', async () => {
    let createdData: any = null;
    const prisma = {
      interest: {
        findUnique: async () => ({ id: 'interest-1' }),
      },
      match: {
        upsert: async ({ create }: any) => {
          createdData = create;
          return { id: 'match-456', ...create };
        },
      },
      matchScore: {
        findUnique: async () => ({
          totalScore: 0.75,
          sharedFilmIds: ['film-a', 'film-b', 'film-c'],
        }),
      },
    } as any;

    await createMatchIfMutual(prisma, 'user-x', 'user-y');

    expect(createdData.score).toBe(0.75);
    expect(createdData.sharedFilmIds).toEqual(['film-a', 'film-b', 'film-c']);
  });

  it('defaults to zero score when no match score exists', async () => {
    let createdData: any = null;
    const prisma = {
      interest: {
        findUnique: async () => ({ id: 'interest-1' }),
      },
      match: {
        upsert: async ({ create }: any) => {
          createdData = create;
          return { id: 'match-789', ...create };
        },
      },
      matchScore: {
        findUnique: async () => null,
      },
    } as any;

    await createMatchIfMutual(prisma, 'user-m', 'user-n');

    expect(createdData.score).toBe(0);
    expect(createdData.sharedFilmIds).toEqual([]);
  });

  it('uses canonical ordering for user IDs', async () => {
    let createdData: any = null;
    const prisma = {
      interest: {
        findUnique: async () => ({ id: 'interest-1' }),
      },
      match: {
        upsert: async ({ create }: any) => {
          createdData = create;
          return { id: 'match-abc', ...create };
        },
      },
      matchScore: {
        findUnique: async () => null,
      },
    } as any;

    // user-z comes after user-a alphabetically
    await createMatchIfMutual(prisma, 'user-z', 'user-a');

    expect(createdData.userAId).toBe('user-a');
    expect(createdData.userBId).toBe('user-z');
  });
});
