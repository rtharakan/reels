/**
 * Jaccard similarity for film overlap: |A ∩ B| / |A ∪ B|
 */
export function computeFilmOverlap(filmsA: string[], filmsB: string[]): {
  score: number;
  sharedFilmIds: string[];
} {
  const setA = new Set(filmsA);
  const setB = new Set(filmsB);
  const intersection = filmsA.filter((id) => setB.has(id));
  const unionSize = new Set([...filmsA, ...filmsB]).size;

  return {
    score: unionSize === 0 ? 0 : intersection.length / unionSize,
    sharedFilmIds: intersection,
  };
}
