import { describe, it, expect, vi } from 'vitest';
import { importWatchlist } from '../watchlist-import';

// Mock the letterboxd-scraper package
vi.mock('@reels/letterboxd-scraper', () => ({
  scrapeWatchlist: vi.fn(),
  scrapeFilms: vi.fn(),
  scrapeRatings: vi.fn(),
  scrapeLikes: vi.fn(),
  normalizeFilms: vi.fn(),
}));

import {
  scrapeWatchlist,
  scrapeFilms,
  scrapeRatings,
  scrapeLikes,
  normalizeFilms,
} from '@reels/letterboxd-scraper';

const mockScrapeWatchlist = vi.mocked(scrapeWatchlist);
const mockScrapeFilms = vi.mocked(scrapeFilms);
const mockScrapeRatings = vi.mocked(scrapeRatings);
const mockScrapeLikes = vi.mocked(scrapeLikes);
const mockNormalizeFilms = vi.mocked(normalizeFilms);

function createMockPrisma() {
  const films = new Map<number, { id: string; tmdbId: number }>();
  let filmCounter = 0;

  return {
    film: {
      upsert: vi.fn().mockImplementation(async ({ where, create }: any) => {
        const existing = films.get(where.tmdbId);
        if (existing) return existing;
        const film = { id: `film-${filmCounter++}`, tmdbId: create.tmdbId, ...create };
        films.set(create.tmdbId, film);
        return film;
      }),
    },
    watchlistEntry: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    watchedEntry: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    likedEntry: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    ratingEntry: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
    seenUser: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    $transaction: vi.fn().mockImplementation(async (ops: unknown[]) => {
      return Promise.all(ops);
    }),
  } as any;
}

describe('importWatchlist', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_API_READ_ACCESS_TOKEN', 'test-tmdb-token');
    vi.clearAllMocks();
  });

  it('throws when TMDB API token is not configured', async () => {
    vi.stubEnv('TMDB_API_READ_ACCESS_TOKEN', '');
    const prisma = createMockPrisma();

    await expect(importWatchlist(prisma, 'user-1', 'testuser'))
      .rejects.toThrow('TMDB API token not configured');
  });

  it('throws when the Letterboxd profile is private', async () => {
    const prisma = createMockPrisma();
    mockScrapeWatchlist.mockResolvedValue({
      films: [],
      isPrivate: true,
      error: 'This profile is private',
    });
    mockScrapeFilms.mockResolvedValue({ films: [], isPrivate: false });
    mockScrapeRatings.mockResolvedValue({ films: [], isPrivate: false });
    mockScrapeLikes.mockResolvedValue({ films: [], isPrivate: false });

    await expect(importWatchlist(prisma, 'user-1', 'privateuser'))
      .rejects.toThrow('This profile is private');
  });

  it('successfully imports a public watchlist', async () => {
    const prisma = createMockPrisma();
    const films = [
      { slug: 'inception', title: 'Inception', letterboxdId: '1' },
      { slug: 'parasite', title: 'Parasite', letterboxdId: '2' },
    ];

    mockScrapeWatchlist.mockResolvedValue({ films, isPrivate: false });
    mockScrapeFilms.mockResolvedValue({ films: [], isPrivate: false });
    mockScrapeRatings.mockResolvedValue({ films: [], isPrivate: false });
    mockScrapeLikes.mockResolvedValue({ films: [], isPrivate: false });
    mockNormalizeFilms.mockResolvedValue([
      { resolved: { tmdbId: 27205, title: 'Inception', year: 2010, posterPath: '/inception.jpg', genreIds: [28, 878] } },
      { resolved: { tmdbId: 496243, title: 'Parasite', year: 2019, posterPath: '/parasite.jpg', genreIds: [35, 18, 53] } },
    ] as any);

    const result = await importWatchlist(prisma, 'user-1', 'testuser');

    expect(result.totalScraped).toBe(2);
    expect(result.totalResolved).toBe(2);
    expect(result.totalUnresolved).toBe(0);
    expect(result.isEligibleForMatching).toBe(false); // < 5 films
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { letterboxdUsername: 'testuser' },
    });
  });

  it('marks user as eligible for matching with 5+ resolved films', async () => {
    const prisma = createMockPrisma();
    const films = Array.from({ length: 6 }, (_, i) => ({
      slug: `film-${i}`, title: `Film ${i}`, letterboxdId: `${i}`,
    }));

    mockScrapeWatchlist.mockResolvedValue({ films, isPrivate: false });
    mockScrapeFilms.mockResolvedValue({ films: [], isPrivate: false });
    mockScrapeRatings.mockResolvedValue({ films: [], isPrivate: false });
    mockScrapeLikes.mockResolvedValue({ films: [], isPrivate: false });
    mockNormalizeFilms.mockResolvedValue(
      films.map((_, i) => ({
        resolved: { tmdbId: 1000 + i, title: `Film ${i}`, year: 2020, posterPath: `/f${i}.jpg`, genreIds: [18] },
      })) as any,
    );

    const result = await importWatchlist(prisma, 'user-1', 'testuser');

    expect(result.totalResolved).toBe(6);
    expect(result.isEligibleForMatching).toBe(true);
  });

  it('handles unresolved films gracefully', async () => {
    const prisma = createMockPrisma();
    const films = [
      { slug: 'known-film', title: 'Known Film', letterboxdId: '1' },
      { slug: 'unknown-film', title: 'Unknown Film', letterboxdId: '2' },
    ];

    mockScrapeWatchlist.mockResolvedValue({ films, isPrivate: false });
    mockScrapeFilms.mockResolvedValue({ films: [], isPrivate: false });
    mockScrapeRatings.mockResolvedValue({ films: [], isPrivate: false });
    mockScrapeLikes.mockResolvedValue({ films: [], isPrivate: false });
    mockNormalizeFilms.mockResolvedValue([
      { resolved: { tmdbId: 100, title: 'Known Film', year: 2020, posterPath: '/known.jpg', genreIds: [18] } },
      { resolved: null },
    ] as any);

    const result = await importWatchlist(prisma, 'user-1', 'testuser');

    expect(result.totalResolved).toBe(1);
    expect(result.totalUnresolved).toBe(1);
  });
});

// Need to import beforeEach
import { beforeEach } from 'vitest';
