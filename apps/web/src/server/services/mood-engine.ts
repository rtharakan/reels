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
 * Get mood-based film suggestions using community tags + AI layer.
 * AI layer uses HuggingFace/Voyage AI + MongoDB Atlas when configured,
 * falls back to TMDB genre-based discovery.
 * Wraps total execution in a 5-second timeout.
 */
export async function getMoodSuggestions(
  prisma: PrismaClient,
  userId: string,
  mood: MoodType,
): Promise<MoodSuggestion[]> {
  const communityResults = getCommunitySuggestions(prisma, userId, mood);

  try {
    const result = await Promise.race([
      Promise.all([communityResults, getAISuggestions(userId, mood)]),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);

    if (result) {
      const [community, ai] = result;
      return deduplicateAndMerge(community, ai);
    }
  } catch {
    // Fallback to community only
  }

  // If everything times out, try community only
  try {
    return await communityResults;
  } catch {
    // Last resort: just AI/TMDB suggestions
    return getAISuggestions(userId, mood);
  }
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
 * AI-powered suggestions using Voyage-4-nano embeddings via HuggingFace
 * Inference API + MongoDB Atlas Vector Search.
 * Reference: https://huggingface.co/blog/mongodb-community/hugging-face-mongodb-voyage-4-nano
 *
 * Requires env vars:
 *   HUGGINGFACE_API_KEY — HuggingFace Inference API token
 *   MONGODB_ATLAS_URI   — MongoDB Atlas connection string
 *   MONGODB_DB_NAME     — Database name (default: movies_db)
 *
 * Falls back to TMDB genre-based discovery when these aren't configured.
 */
async function getAISuggestions(
  _userId: string,
  mood: MoodType,
): Promise<MoodSuggestion[]> {
  const hfToken = process.env.HUGGINGFACE_API_KEY;
  const mongoUri = process.env.MONGODB_ATLAS_URI;

  // If HuggingFace + MongoDB are configured, use the full vector search pipeline
  if (hfToken && mongoUri) {
    try {
      return await getVoyageVectorSuggestions(mood, hfToken, mongoUri);
    } catch {
      // Fall through to TMDB-based fallback
    }
  }

  // TMDB genre/keyword fallback — always available
  return getTMDBMoodSuggestions(mood);
}

/**
 * Voyage-4-nano + MongoDB Atlas Vector Search pipeline.
 * 1. Embeds mood descriptor using HuggingFace Inference API (voyage-4-nano)
 * 2. Queries MongoDB Atlas Vector Search for semantically similar film plots
 */
async function getVoyageVectorSuggestions(
  mood: MoodType,
  hfToken: string,
  mongoUri: string,
): Promise<MoodSuggestion[]> {
  const moodPrompt = MOOD_PROMPTS[mood];

  // Step 1: Get embedding from HuggingFace Inference API (voyage-4-nano)
  const embeddingRes = await fetch(
    'https://router.huggingface.co/voyageai/v1/embeddings',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: [moodPrompt],
        model: 'voyage-4-nano',
        input_type: 'query',
        output_dimension: 1024,
      }),
    },
  );

  if (!embeddingRes.ok) {
    throw new Error(`HuggingFace embedding failed: ${embeddingRes.status}`);
  }

  const embeddingData = await embeddingRes.json() as {
    data: Array<{ embedding: number[] }>;
  };
  const queryVector = embeddingData.data?.[0]?.embedding;
  if (!queryVector?.length) throw new Error('Empty embedding returned');

  // Step 2: Query MongoDB Atlas Vector Search via dynamic import
  // mongodb is an optional peer dependency — only loaded when MONGODB_ATLAS_URI is set
  let MongoClient: { new(uri: string): { connect(): Promise<void>; close(): Promise<void>; db(name: string): { collection(name: string): { aggregate(pipeline: unknown[]): { toArray(): Promise<Record<string, unknown>[]> } } } } };
  try {
    const mod = await (Function('return import("mongodb")')() as Promise<{ MongoClient: typeof MongoClient }>);
    MongoClient = mod.MongoClient;
  } catch {
    throw new Error('mongodb package not installed — run: pnpm add mongodb');
  }
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const dbName = process.env.MONGODB_DB_NAME ?? 'movies_db';
    const db = client.db(dbName);
    const collection = db.collection('movies');

    const pipeline = [
      {
        $vectorSearch: {
          index: 'mood_search_index',
          path: 'plot_embedding',
          queryVector,
          numCandidates: 150,
          limit: 10,
        },
      },
      {
        $project: {
          _id: 0,
          title: 1,
          plot: 1,
          genres: 1,
          year: 1,
          poster_path: 1,
          imdb_rating: 1,
          mood_match_score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    return results.map((r: Record<string, unknown>, i: number) => ({
      id: `ai-${mood}-${i}`,
      filmId: `ai-${String(r.title).toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      filmTitle: String(r.title ?? 'Unknown'),
      filmYear: typeof r.year === 'number' ? r.year : null,
      filmPosterPath: typeof r.poster_path === 'string' ? r.poster_path : null,
      mood,
      matchExplanation: `AI-matched to your ${mood.toLowerCase()} vibe via semantic search (${Math.round(((r.mood_match_score as number) ?? 0) * 100)}% similarity)`,
      matchStrength: Math.min(1, ((r.mood_match_score as number) ?? 0.5)),
      source: 'ai' as const,
    }));
  } finally {
    await client.close();
  }
}

/** Maps mood types to descriptive prompts for semantic search */
const MOOD_PROMPTS: Record<MoodType, string> = {
  NOSTALGIC: 'A warm, nostalgic film that brings back fond memories of childhood and simpler times, with a bittersweet tone',
  ADVENTUROUS: 'An exciting adventure film full of thrills, exploration, and epic journeys to unknown places',
  HEARTBROKEN: 'A deeply emotional film about heartbreak, loss, and processing grief that makes you cry',
  HYPE: 'An adrenaline-pumping, high-energy action film with intense sequences and non-stop excitement',
  CHILL: 'A calm, relaxing, feel-good movie perfect for unwinding, with a gentle pace and soothing atmosphere',
  ROMANTIC: 'A beautiful love story full of passion, tenderness, and the magic of falling in love',
  MYSTERIOUS: 'A dark, intriguing mystery or thriller that keeps you guessing with unexpected twists',
  INSPIRED: 'An inspirational film about overcoming obstacles, achieving dreams, and the triumph of the human spirit',
  MELANCHOLIC: 'A beautifully melancholic film with artistic depth, exploring sadness, loneliness, and the human condition',
  COZY: 'A warm, cozy comfort film perfect for a rainy day, with heartwarming characters and a feel-good ending',
};

/** TMDB genre IDs mapped to mood types for fallback */
const MOOD_GENRE_MAP: Record<MoodType, { genres: number[]; keywords: string }> = {
  NOSTALGIC: { genres: [18, 10751], keywords: 'nostalgic|childhood|memories' },
  ADVENTUROUS: { genres: [12, 28], keywords: 'adventure|quest|journey' },
  HEARTBROKEN: { genres: [18, 10749], keywords: 'heartbreak|loss|grief' },
  HYPE: { genres: [28, 53], keywords: 'action|adrenaline|intense' },
  CHILL: { genres: [35, 10751], keywords: 'relaxing|feel-good|lighthearted' },
  ROMANTIC: { genres: [10749], keywords: 'love|romance|passion' },
  MYSTERIOUS: { genres: [9648, 53], keywords: 'mystery|detective|suspense' },
  INSPIRED: { genres: [18, 36], keywords: 'inspirational|triumph|dream' },
  MELANCHOLIC: { genres: [18], keywords: 'melancholy|sad|lonely' },
  COZY: { genres: [16, 35, 10751], keywords: 'heartwarming|comfort|cozy' },
};

/**
 * TMDB-based mood suggestions fallback.
 * Uses the Discover API with mood-appropriate genres.
 */
async function getTMDBMoodSuggestions(mood: MoodType): Promise<MoodSuggestion[]> {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN ?? process.env.TMDB_API_TOKEN;
  if (!token) return [];

  const mapping = MOOD_GENRE_MAP[mood];
  const genreIds = mapping.genres.join(',');
  const params = new URLSearchParams({
    with_genres: genreIds,
    sort_by: 'vote_average.desc',
    'vote_count.gte': '200',
    language: 'en-US',
    page: String(1 + Math.floor(Math.random() * 3)), // Randomize page 1-3 for variety
  });

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (!res.ok) return [];

    const data = await res.json();
    const films = (data.results ?? []).slice(0, 8);

    return films.map((r: Record<string, unknown>, i: number) => ({
      id: `tmdb-${mood}-${r.id}`,
      filmId: `tmdb-${r.id}`,
      filmTitle: String(r.title ?? 'Unknown'),
      filmYear: r.release_date ? parseInt(String(r.release_date).slice(0, 4), 10) : null,
      filmPosterPath: (r.poster_path as string) ?? null,
      mood,
      matchExplanation: `Matches your ${mood.toLowerCase()} mood — ${MOOD_PROMPTS[mood].slice(0, 80)}`,
      matchStrength: Math.max(0.5, 1 - i * 0.06),
      source: 'ai' as const,
    }));
  } catch {
    return [];
  }
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
