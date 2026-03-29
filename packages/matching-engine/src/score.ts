import { computeFilmOverlap } from './overlap';
import { computeGenreSimilarity, buildGenreVector } from './genre-similarity';

export type MatchScoreInput = {
  userAFilmIds: string[];
  userAGenres: number[][]; // genreIds per film
  userBFilmIds: string[];
  userBGenres: number[][]; // genreIds per film
};

export type MatchScoreResult = {
  filmOverlap: number;
  genreSimilarity: number;
  totalScore: number;
  sharedFilmIds: string[];
};

const FILM_OVERLAP_WEIGHT = 0.7;
const GENRE_SIMILARITY_WEIGHT = 0.3;

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
