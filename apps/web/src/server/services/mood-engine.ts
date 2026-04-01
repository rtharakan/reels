import type { PrismaClient } from '@prisma/client';

type MoodType = 'NOSTALGIC' | 'ADVENTUROUS' | 'HEARTBROKEN' | 'HYPE' | 'CHILL' | 'ROMANTIC' | 'MYSTERIOUS' | 'INSPIRED' | 'MELANCHOLIC' | 'COZY';

interface MoodSuggestion {
  id: string;
  filmId: string;
  filmTitle: string;
  filmYear: number | null;
  filmPosterPath: string | null;
  mood: string;
  matchExplanation: string;
  matchStrength: number;
  source: 'community' | 'ai';
}

interface MoodTwin {
  userId: string;
  displayName: string | null;
  image: string | null;
  sharedFilmCount: number;
  mood: string;
}

/**
 * Get mood-based film suggestions using community tags + optional AI layer.
 * Wraps total execution in a 3-second timeout — falls back to community-only.
 */
export async function getMoodSuggestions(
  prisma: PrismaClient,
  userId: string,
  mood: MoodType,
): Promise<MoodSuggestion[]> {
  const communityResults = getCommunitySuggestions(prisma, userId, mood);

  // If MongoDB Atlas is configured, try AI layer with timeout
  if (process.env.MONGODB_ATLAS_URI) {
    try {
      const result = await Promise.race([
        Promise.all([communityResults, getAISuggestions(userId, mood)]),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000)),
      ]);

      if (result) {
        const [community, ai] = result;
        return deduplicateAndMerge(community, ai);
      }
    } catch {
      // Fallback to community only
    }
  }

  return communityResults;
}

/**
 * Community-based mood suggestions from MoodFilmTag data.
 */
async function getCommunitySuggestions(
  prisma: PrismaClient,
  userId: string,
  mood: MoodType,
): Promise<MoodSuggestion[]> {
  const taggedFilms = await prisma.moodFilmTag.groupBy({
    by: ['filmId'],
    where: { mood: mood as never },
    _count: { filmId: true },
    orderBy: { _count: { filmId: 'desc' } },
    take: 10,
  });

  if (taggedFilms.length === 0) return [];

  const filmIds = taggedFilms.map((t) => t.filmId);
  const films = await prisma.film.findMany({
    where: { id: { in: filmIds } },
    select: { id: true, title: true, year: true, posterPath: true },
  });

  const filmMap = new Map(films.map((f) => [f.id, f]));

  return taggedFilms
    .reduce<MoodSuggestion[]>((acc, t) => {
      const film = filmMap.get(t.filmId);
      if (!film) return acc;
      acc.push({
        id: `${userId}-${film.id}-${mood}`,
        filmId: film.id,
        filmTitle: film.title,
        filmYear: film.year,
        filmPosterPath: film.posterPath,
        mood,
        matchExplanation: `This film matches your ${mood.toLowerCase()} vibe based on community tags`,
        matchStrength: Math.min(1, t._count.filmId / 10),
        source: 'community' as const,
      });
      return acc;
    }, []);
}

/**
 * AI-powered suggestions using MongoDB Atlas Vector Search.
 */
async function getAISuggestions(
  _userId: string,
  mood: MoodType,
): Promise<MoodSuggestion[]> {
  // AI layer placeholder — requires MongoDB Atlas Vector Search setup
  // Would use pre-computed mood embedding vectors to query plotEmbedding field
  void mood;
  return [];
}

function deduplicateAndMerge(
  community: MoodSuggestion[],
  ai: MoodSuggestion[],
): MoodSuggestion[] {
  const seen = new Set(community.map((s) => s.filmId));
  const merged = [...community];
  for (const s of ai) {
    if (!seen.has(s.filmId)) {
      seen.add(s.filmId);
      merged.push(s);
    }
  }
  return merged.slice(0, 10);
}

/**
 * Find "Mood Twins" — other users currently in the same mood.
 * Excludes blocked users.
 */
export async function getMoodTwins(
  prisma: PrismaClient,
  userId: string,
  mood: MoodType,
): Promise<MoodTwin[]> {
  const twins = await prisma.userMood.findMany({
    where: {
      mood: mood as never,
      isActive: true,
      userId: { not: userId },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    take: 10,
  });

  const blocked = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: userId },
        { blockedUserId: userId },
      ],
    },
    select: { blockerId: true, blockedUserId: true },
  });
  const blockedIds = new Set(blocked.map((b) => b.blockerId === userId ? b.blockedUserId : b.blockerId));

  return twins
    .filter((t) => !blockedIds.has(t.user.id))
    .map((t) => ({
      userId: t.user.id,
      displayName: t.user.name,
      image: t.user.image,
      sharedFilmCount: 0,
      mood,
    }));
}
