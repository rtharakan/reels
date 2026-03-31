import { describe, it, expect, vi } from 'vitest';
import { recomputeMatchScores } from '../match-score';

function createMockPrisma(opts: {
  userFilmCount?: number;
  otherUsers?: { id: string }[];
  otherFilmCount?: number;
}) {
  const filmCountPerUser = opts.userFilmCount ?? 10;
  const otherUsers = opts.otherUsers ?? [];

  // Track upsert calls
  const upsertCalls: unknown[] = [];

  return {
    user: {
      findMany: vi.fn().mockResolvedValue(otherUsers),
    },
    watchlistEntry: {
      findMany: vi.fn().mockResolvedValue(
        Array.from({ length: filmCountPerUser }, (_, i) => ({
          userId: 'test',
          film: { id: `film-${i}`, tmdbId: i + 100, genreIds: [18, 80] },
        })),
      ),
    },
    watchedEntry: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    ratingEntry: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    likedEntry: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    matchScore: {
      upsert: vi.fn().mockImplementation(async (args: unknown) => {
        upsertCalls.push(args);
        return {};
      }),
    },
    $transaction: vi.fn().mockImplementation(async (ops: unknown[]) => {
      return Promise.all(ops);
    }),
    _upsertCalls: upsertCalls,
  } as any;
}

describe('recomputeMatchScores', () => {
  it('skips computation when user has fewer than 5 total films', async () => {
    const prisma = createMockPrisma({
      userFilmCount: 2,
      otherUsers: [{ id: 'other-1' }],
    });
    await recomputeMatchScores(prisma, 'user-1');

    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('skips candidates with fewer than 5 total films', async () => {
    const prisma = createMockPrisma({
      userFilmCount: 10,
      otherUsers: [{ id: 'other-1' }],
      otherFilmCount: 2,
    });

    // Override the findMany to return few films for the other user
    prisma.watchlistEntry.findMany.mockImplementation(async ({ where }: any) => {
      if (where.userId?.in) {
        // Batch query for other users - return only 2 films
        return Array.from({ length: 2 }, (_, i) => ({
          userId: 'other-1',
          film: { id: `ofilm-${i}`, tmdbId: i + 200, genreIds: [28] },
        }));
      }
      // Single user query
      return Array.from({ length: 10 }, (_, i) => ({
        userId: 'user-1',
        film: { id: `film-${i}`, tmdbId: i + 100, genreIds: [18, 80] },
      }));
    });

    await recomputeMatchScores(prisma, 'user-1');

    // Should not have created any score records
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('computes bidirectional scores (A→B and B→A)', async () => {
    // Create shared films that appear for both user-1 and other-1
    const makeFilms = (userId: string) =>
      Array.from({ length: 6 }, (_, i) => ({
        userId,
        film: { id: `film-${i}`, tmdbId: i + 100, genreIds: [18, 80] },
      }));

    const user1Films = makeFilms('user-1');
    const other1Films = makeFilms('other-1');

    const prisma = {
      user: {
        findMany: vi.fn().mockResolvedValue([{ id: 'other-1' }]),
      },
      watchlistEntry: {
        findMany: vi.fn().mockImplementation(async ({ where }: any) => {
          if (where.userId === 'user-1') return user1Films;
          if (where.userId?.in) return other1Films;
          return [];
        }),
      },
      watchedEntry: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      ratingEntry: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      likedEntry: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      matchScore: {
        upsert: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn().mockResolvedValue([]),
    } as any;

    await recomputeMatchScores(prisma, 'user-1');

    // $transaction should have been called with upsert operations for A→B and B→A
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
