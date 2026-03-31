import { computeFilmOverlap } from './overlap';
import { computeGenreSimilarity, buildGenreVector } from './genre-similarity';

export type MatchScoreInput = {
  userAFilmIds: string[];
  userAGenres: number[][]; // genreIds per film
  userBFilmIds: string[];
  userBGenres: number[][]; // genreIds per film
};

export type EnhancedMatchScoreInput = {
  // Watchlist (want to watch)
  userAWatchlistIds: string[];
  userAWatchlistGenres: number[][];
  userBWatchlistIds: string[];
  userBWatchlistGenres: number[][];
  // Watched films (diary/activity)
  userAWatchedIds: string[];
  userAWatchedGenres: number[][];
  userBWatchedIds: string[];
  userBWatchedGenres: number[][];
  // Ratings (films rated ≥4.0 stars)
  userAHighRatedIds: string[];
  userAHighRatedGenres: number[][];
  userBHighRatedIds: string[];
  userBHighRatedGenres: number[][];
  // Likes (explicitly hearted films)
  userALikedIds: string[];
  userALikedGenres: number[][];
  userBLikedIds: string[];
  userBLikedGenres: number[][];
};

export type MatchScoreResult = {
  filmOverlap: number;
  genreSimilarity: number;
  totalScore: number;
  sharedFilmIds: string[];
};

export type EnhancedMatchScoreResult = {
  likedOverlap: number;
  ratedOverlap: number;
  watchedOverlap: number;
  watchlistOverlap: number;
  genreSimilarity: number;
  totalScore: number;
  sharedLikedIds: string[];
  sharedRatedIds: string[];
  sharedWatchedIds: string[];
  sharedWatchlistIds: string[];
  // Legacy compat
  filmOverlap: number;
  sharedFilmIds: string[];
};

// Legacy weights (kept for backward compatibility)
const FILM_OVERLAP_WEIGHT = 0.7;
const GENRE_SIMILARITY_WEIGHT = 0.3;

/**
 * Enhanced weights — prioritise stronger taste signals.
 *
 * Rationale (inspired by Hinge/Feeld matching principles):
 * - Likes (30%): Strongest signal — user explicitly endorsed the film.
 * - High ratings (25%): Strong conscious appreciation (≥4★).
 * - Genre similarity (20%): Overall taste profile compatibility across all sources.
 * - Watched overlap (15%): Shared viewing experience, even if not loved.
 * - Watchlist overlap (10%): Shared curiosity/intent (weakest direct signal).
 *
 * Signal presence bonus:
 * When both users have data across multiple signal types (likes, ratings, watched, watchlist),
 * the score gets a confidence boost — more overlapping signals = more reliable match.
 * This prevents inflated scores from a single coincidental overlap.
 */
const LIKED_OVERLAP_WEIGHT = 0.30;
const RATED_OVERLAP_WEIGHT = 0.25;
const WATCHED_OVERLAP_WEIGHT = 0.15;
const WATCHLIST_OVERLAP_WEIGHT = 0.10;
const GENRE_SIMILARITY_WEIGHT_ENHANCED = 0.20;

/**
 * Legacy scoring: 70% film overlap + 30% genre similarity.
 * Kept for backward compatibility.
 */
export function computeMatchScore(input: MatchScoreInput): MatchScoreResult {
  const { score: filmOverlap, sharedFilmIds } = computeFilmOverlap(
    input.userAFilmIds,
    input.userBFilmIds,
  );

  const genreVectorA = buildGenreVector(input.userAGenres);
  const genreVectorB = buildGenreVector(input.userBGenres);
  const genreSimilarity = computeGenreSimilarity(genreVectorA, genreVectorB);

  const totalScore = FILM_OVERLAP_WEIGHT * filmOverlap + GENRE_SIMILARITY_WEIGHT * genreSimilarity;

  return {
    filmOverlap,
    genreSimilarity,
    totalScore,
    sharedFilmIds,
  };
}

/**
 * Enhanced scoring that incorporates likes, ratings, watched films, and watchlist.
 *
 * Score = 0.30 × likedOverlap
 *       + 0.25 × ratedOverlap
 *       + 0.15 × watchedOverlap
 *       + 0.10 × watchlistOverlap
 *       + 0.20 × genreSimilarity
 *
 * Genre similarity is computed across ALL film sources combined to capture
 * the user's full taste profile.
 *
 * Falls back gracefully when signals are unavailable (e.g. user has no likes):
 * missing signals contribute 0 and the denominator stays at 1.0.
 */
export function computeEnhancedMatchScore(input: EnhancedMatchScoreInput): EnhancedMatchScoreResult {
  const liked = computeFilmOverlap(input.userALikedIds, input.userBLikedIds);
  const rated = computeFilmOverlap(input.userAHighRatedIds, input.userBHighRatedIds);
  const watched = computeFilmOverlap(input.userAWatchedIds, input.userBWatchedIds);
  const watchlist = computeFilmOverlap(input.userAWatchlistIds, input.userBWatchlistIds);

  // Build genre vectors from ALL sources combined for a richer taste profile
  const allGenresA = [
    ...input.userALikedGenres,
    ...input.userAHighRatedGenres,
    ...input.userAWatchedGenres,
    ...input.userAWatchlistGenres,
  ];
  const allGenresB = [
    ...input.userBLikedGenres,
    ...input.userBHighRatedGenres,
    ...input.userBWatchedGenres,
    ...input.userBWatchlistGenres,
  ];

  const genreVectorA = buildGenreVector(allGenresA);
  const genreVectorB = buildGenreVector(allGenresB);
  const genreSimilarity = computeGenreSimilarity(genreVectorA, genreVectorB);

  const rawScore =
    LIKED_OVERLAP_WEIGHT * liked.score +
    RATED_OVERLAP_WEIGHT * rated.score +
    WATCHED_OVERLAP_WEIGHT * watched.score +
    WATCHLIST_OVERLAP_WEIGHT * watchlist.score +
    GENRE_SIMILARITY_WEIGHT_ENHANCED * genreSimilarity;

  // Signal confidence multiplier (Hinge-inspired):
  // More active signals = more reliable score.
  // Count how many signal types both users actually have data for.
  const signalPresent = [
    input.userALikedIds.length > 0 && input.userBLikedIds.length > 0,
    input.userAHighRatedIds.length > 0 && input.userBHighRatedIds.length > 0,
    input.userAWatchedIds.length > 0 && input.userBWatchedIds.length > 0,
    input.userAWatchlistIds.length > 0 && input.userBWatchlistIds.length > 0,
    allGenresA.length > 0 && allGenresB.length > 0,
  ].filter(Boolean).length;

  // Confidence: 1 signal = 0.7x, 2 = 0.8x, 3 = 0.9x, 4 = 0.95x, 5 = 1.0x
  const confidenceMultiplier = signalPresent <= 1 ? 0.7
    : signalPresent === 2 ? 0.8
    : signalPresent === 3 ? 0.9
    : signalPresent === 4 ? 0.95
    : 1.0;

  const totalScore = rawScore * confidenceMultiplier;

  // Combine all shared film IDs (deduplicated) for legacy compat
  const allSharedIds = new Set([
    ...liked.sharedFilmIds,
    ...rated.sharedFilmIds,
    ...watched.sharedFilmIds,
    ...watchlist.sharedFilmIds,
  ]);

  return {
    likedOverlap: liked.score,
    ratedOverlap: rated.score,
    watchedOverlap: watched.score,
    watchlistOverlap: watchlist.score,
    genreSimilarity,
    totalScore,
    sharedLikedIds: liked.sharedFilmIds,
    sharedRatedIds: rated.sharedFilmIds,
    sharedWatchedIds: watched.sharedFilmIds,
    sharedWatchlistIds: watchlist.sharedFilmIds,
    // Legacy compat
    filmOverlap: watchlist.score,
    sharedFilmIds: [...allSharedIds],
  };
}
