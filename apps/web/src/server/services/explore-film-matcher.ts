/**
 * Fuzzy film title matching for Explore date planner.
 * Matches watchlist films against cinema screenings.
 * Adapted from https://github.com/rtharakan/letterboxd-watchlist
 */

import type { ExploreFilm } from './explore-scraper';
import type { ExploreScreening } from './explore-screenings';

export interface ExploreMatchedScreening {
  film: ExploreFilm;
  screening: ExploreScreening;
  matchScore: number;
}

const ARTICLES = ['the', 'a', 'an', 'de', 'het', 'een'];
const PUNCTUATION_REGEX = /[^a-z0-9\s]/g;
const WHITESPACE_REGEX = /\s+/g;

function normalize(title: string): string {
  if (!title) return '';
  let normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  for (const article of ARTICLES) {
    const pattern = new RegExp(`^${article}\\s+`, 'i');
    normalized = normalized.replace(pattern, '');
  }

  return normalized
    .replace(PUNCTUATION_REGEX, ' ')
    .replace(WHITESPACE_REGEX, ' ')
    .trim();
}

function yearScore(
  yearA: number | undefined,
  yearB: number | undefined
): number {
  if (yearA === undefined || yearB === undefined) return 0.5;
  const diff = Math.abs(yearA - yearB);
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.8;
  return 0.0;
}

/**
 * Simple token-set similarity as a lightweight alternative to fuzzball.
 */
function tokenSetRatio(a: string, b: string): number {
  const tokensA = new Set(a.split(/\s+/).filter(Boolean));
  const tokensB = new Set(b.split(/\s+/).filter(Boolean));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) intersection++;
  }

  const union = tokensA.size + tokensB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function matchFilm(film: ExploreFilm, screening: ExploreScreening): number {
  const normFilm = normalize(film.title);
  const normScreening = normalize(screening.filmTitle);

  if (normFilm === normScreening) {
    const yScore = yearScore(film.year, screening.filmYear);
    if (yScore > 0.5) return 1.0;
  }

  const titleScore = tokenSetRatio(normFilm, normScreening);
  const yScore = yearScore(film.year, screening.filmYear);

  if (titleScore < 0.6) return 0;
  if (
    film.year &&
    screening.filmYear &&
    Math.abs(film.year - screening.filmYear) > 1
  ) {
    return 0;
  }

  return titleScore * 0.6 + yScore * 0.4;
}

export function findExploreMatchingScreenings(
  films: ExploreFilm[],
  screenings: ExploreScreening[]
): ExploreMatchedScreening[] {
  const matches: ExploreMatchedScreening[] = [];
  const THRESHOLD = 0.7;

  for (const film of films) {
    for (const screening of screenings) {
      const score = matchFilm(film, screening);
      if (score >= THRESHOLD) {
        matches.push({
          film,
          screening,
          matchScore: Math.round(score * 100) / 100,
        });
      }
    }
  }

  // Deduplicate: keep highest score per film+screening combo
  const seen = new Map<string, ExploreMatchedScreening>();
  for (const m of matches) {
    const key = `${m.film.letterboxdSlug}:${m.screening.cinemaName}:${m.screening.date}:${m.screening.time}`;
    const existing = seen.get(key);
    if (!existing || m.matchScore > existing.matchScore) {
      seen.set(key, m);
    }
  }

  return Array.from(seen.values()).sort((a, b) => {
    const scoreDiff = b.matchScore - a.matchScore;
    if (scoreDiff !== 0) return scoreDiff;
    const dateDiff = a.screening.date.localeCompare(b.screening.date);
    if (dateDiff !== 0) return dateDiff;
    return a.screening.time.localeCompare(b.screening.time);
  });
}
