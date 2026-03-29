/**
 * Cosine similarity on aggregate genre distribution vectors.
 * Each dimension = count of films in that TMDB genre across the user's watchlist.
 */
export function computeGenreSimilarity(
  genreVectorA: Map<number, number>,
  genreVectorB: Map<number, number>,
): number {
  const allGenres = new Set([...genreVectorA.keys(), ...genreVectorB.keys()]);

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const genre of allGenres) {
    const a = genreVectorA.get(genre) ?? 0;
    const b = genreVectorB.get(genre) ?? 0;
    dotProduct += a * b;
    magnitudeA += a * a;
    magnitudeB += b * b;
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Build a genre frequency vector from films' genre IDs.
 */
export function buildGenreVector(filmsGenreIds: number[][]): Map<number, number> {
  const vector = new Map<number, number>();
  for (const genres of filmsGenreIds) {
    for (const genreId of genres) {
      vector.set(genreId, (vector.get(genreId) ?? 0) + 1);
    }
  }
  return vector;
}
