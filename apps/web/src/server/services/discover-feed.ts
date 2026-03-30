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

  // Get today's date in the user's timezone, then compute the correct UTC offset
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz });
  const todayStr = formatter.format(now); // YYYY-MM-DD in user's local tz
  // Build midnight in the user's timezone by computing the UTC offset
  const localMidnight = new Date(`${todayStr}T00:00:00`);
  const utcMidnight = new Date(`${todayStr}T00:00:00Z`);
  const tzOffsetMs = utcMidnight.getTime() - localMidnight.getTime();
  const todayDate = new Date(utcMidnight.getTime() + tzOffsetMs);

  const allocation = await prisma.dailyAllocation.findUnique({
    where: { userId_allocatedDate: { userId, allocatedDate: todayDate } },
  });

  const cardsUsed = allocation?.cardCount ?? 0;
  const remaining = Math.max(0, MAX_DAILY_CARDS - cardsUsed);

  if (remaining === 0) {
    return { cards: [], remainingToday: 0, isAllCaughtUp: true };
  }

  // Parallelize seen users and blocks queries
  const [seenUsers, blocks] = await Promise.all([
    prisma.seenUser.findMany({
      where: { userId },
      select: { seenUserId: true },
    }),
    prisma.block.findMany({
      where: { OR: [{ blockerId: userId }, { blockedUserId: userId }] },
      select: { blockerId: true, blockedUserId: true },
    }),
  ]);

  const seenUserIds = seenUsers.map((s) => s.seenUserId);
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
      candidate: {
        select: {
          id: true,
          name: true,
          age: true,
          location: true,
          bio: true,
          intent: true,
          profilePhotos: true,
          prompts: true,
          topFilmIds: true,
        },
      },
    },
  });

  // Pre-fetch all needed film IDs in one batch to avoid N+1 queries
  const allSharedFilmIds = new Set<string>();
  const allTopFilmIds = new Set<string>();
  for (const c of candidates) {
    for (const id of c.sharedFilmIds.slice(0, 4)) allSharedFilmIds.add(id);
    for (const id of c.candidate.topFilmIds) allTopFilmIds.add(id);
  }

  const allFilmIds = [...new Set([...allSharedFilmIds, ...allTopFilmIds])];
  const allFilms = allFilmIds.length > 0
    ? await prisma.film.findMany({ where: { id: { in: allFilmIds } } })
    : [];
  const filmMap = new Map(allFilms.map((f) => [f.id, f]));

  const toPreview = (f: typeof allFilms[0]): FilmPreview => ({
    id: f.id,
    tmdbId: f.tmdbId,
    title: f.title,
    year: f.year,
    posterUrl: f.posterPath ? `https://image.tmdb.org/t/p/w500${f.posterPath}` : null,
    genreIds: f.genreIds,
  });

  const cards = candidates.map((c) => {
    const candidate = c.candidate;
    const sharedFilms = c.sharedFilmIds
      .slice(0, 4)
      .map((id) => filmMap.get(id))
      .filter(Boolean)
      .map((f) => toPreview(f!));

    const topFilms = candidate.topFilmIds
      .map((id) => filmMap.get(id))
      .filter(Boolean)
      .map((f) => toPreview(f!));

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
  });

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
