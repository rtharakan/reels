import type { PrismaClient } from '@prisma/client';
import type { DiscoverFeed, FilmPreview } from '@reels/shared-types';

const MAX_DAILY_CARDS = 10;

export async function getDiscoverFeed(
  prisma: PrismaClient,
  userId: string,
): Promise<DiscoverFeed> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { timezone: true, intent: true },
  });

  const tz = user?.timezone ?? 'UTC';
  const userIntent = user?.intent;

  // Get today's allocation
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz });
  const todayStr = formatter.format(now);
  const todayDate = new Date(todayStr + 'T00:00:00.000Z');

  const allocation = await prisma.dailyAllocation.findUnique({
    where: { userId_allocatedDate: { userId, allocatedDate: todayDate } },
  });

  const cardsUsed = allocation?.cardCount ?? 0;
  const remaining = Math.max(0, MAX_DAILY_CARDS - cardsUsed);

  if (remaining === 0) {
    return { cards: [], remainingToday: 0, isAllCaughtUp: true };
  }

  // Get seen users
  const seenUserIds = (
    await prisma.seenUser.findMany({
      where: { userId },
      select: { seenUserId: true },
    })
  ).map((s) => s.seenUserId);

  // Get blocked users (bidirectional)
  const blocks = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedUserId: userId }] },
  });
  const blockedIds = new Set(blocks.map((b) => (b.blockerId === userId ? b.blockedUserId : b.blockerId)));

  // Exclude self, seen, blocked, soft-deleted
  const excludeIds = [...new Set([userId, ...seenUserIds, ...blockedIds])];

  // Intent compatibility filter
  const intentFilter = getIntentFilter(userIntent ?? 'BOTH');

  // Get top candidates by score
  const candidates = await prisma.matchScore.findMany({
    where: {
      userId,
      candidateId: { notIn: excludeIds },
      candidate: {
        deletedAt: null,
        onboardingCompletedAt: { not: null },
        intent: intentFilter,
      },
    },
    orderBy: { totalScore: 'desc' },
    take: remaining,
    include: {
      candidate: true,
    },
  });

  const cards = await Promise.all(
    candidates.map(async (c) => {
      const candidate = c.candidate;

      // Get shared films
      let sharedFilms: FilmPreview[] = [];
      if (c.sharedFilmIds.length > 0) {
        const films = await prisma.film.findMany({
          where: { id: { in: c.sharedFilmIds.slice(0, 4) } },
        });
        sharedFilms = films.map((f) => ({
          id: f.id,
          tmdbId: f.tmdbId,
          title: f.title,
          year: f.year,
          posterUrl: f.posterPath ? `https://image.tmdb.org/t/p/w500${f.posterPath}` : null,
          genreIds: f.genreIds,
        }));
      }

      // Get top films
      let topFilms: FilmPreview[] = [];
      if (candidate.topFilmIds.length > 0) {
        const films = await prisma.film.findMany({
          where: { id: { in: candidate.topFilmIds } },
        });
        topFilms = films.map((f) => ({
          id: f.id,
          tmdbId: f.tmdbId,
          title: f.title,
          year: f.year,
          posterUrl: f.posterPath ? `https://image.tmdb.org/t/p/w500${f.posterPath}` : null,
          genreIds: f.genreIds,
        }));
      }

      return {
        userId: candidate.id,
        name: candidate.name,
        age: candidate.age ?? 0,
        location: candidate.location ?? '',
        bio: candidate.bio,
        intent: candidate.intent ?? 'BOTH',
        profilePhotos: candidate.profilePhotos,
        prompts: (candidate.prompts as { question: string; answer: string }[]) ?? [],
        topFilms,
        matchScore: c.totalScore,
        sharedFilmCount: c.sharedFilmIds.length,
        sharedFilms,
      };
    }),
  );

  return {
    cards,
    remainingToday: remaining - cards.length,
    isAllCaughtUp: cards.length === 0,
  };
}

function getIntentFilter(intent: string) {
  switch (intent) {
    case 'FRIENDS':
      return { in: ['FRIENDS' as const, 'BOTH' as const] };
    case 'DATING':
      return { in: ['DATING' as const, 'BOTH' as const] };
    default:
      return undefined; // BOTH matches everyone
  }
}
