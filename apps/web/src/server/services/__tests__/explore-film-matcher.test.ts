import { describe, it, expect } from 'vitest';
import { findExploreMatchingScreenings } from '../explore-film-matcher';
import type { ExploreFilm } from '../explore-scraper';
import type { ExploreScreening } from '../explore-screenings';

function makeFilm(slug: string, title: string, year?: number): ExploreFilm {
  return {
    letterboxdSlug: slug,
    title,
    year,
    letterboxdUrl: `https://letterboxd.com/film/${slug}/`,
  };
}

function makeScreening(filmTitle: string, filmYear?: number): ExploreScreening {
  return {
    filmTitle,
    filmYear,
    cinemaName: 'Pathé Amsterdam',
    cinemaCity: 'Amsterdam',
    date: '2026-04-01',
    time: '20:00',
  };
}

describe('findExploreMatchingScreenings', () => {
  it('matches exact title and year', () => {
    const films = [makeFilm('the-matrix', 'The Matrix', 1999)];
    const screenings = [makeScreening('The Matrix', 1999)];
    const result = findExploreMatchingScreenings(films, screenings);

    expect(result).toHaveLength(1);
    expect(result[0]!.matchScore).toBe(1);
  });

  it('matches title ignoring case and articles', () => {
    const films = [makeFilm('grand-budapest-hotel', 'The Grand Budapest Hotel', 2014)];
    const screenings = [makeScreening('Grand Budapest Hotel', 2014)];
    const result = findExploreMatchingScreenings(films, screenings);

    expect(result).toHaveLength(1);
    expect(result[0]!.matchScore).toBeGreaterThanOrEqual(0.7);
  });

  it('returns empty for no matches', () => {
    const films = [makeFilm('inception', 'Inception', 2010)];
    const screenings = [makeScreening('Parasite', 2019)];
    const result = findExploreMatchingScreenings(films, screenings);

    expect(result).toHaveLength(0);
  });

  it('does not match films with year difference > 1', () => {
    const films = [makeFilm('dune', 'Dune', 1984)];
    const screenings = [makeScreening('Dune', 2021)];
    const result = findExploreMatchingScreenings(films, screenings);

    expect(result).toHaveLength(0);
  });

  it('handles empty inputs', () => {
    expect(findExploreMatchingScreenings([], [])).toHaveLength(0);
    expect(findExploreMatchingScreenings([makeFilm('a', 'A')], [])).toHaveLength(0);
    expect(findExploreMatchingScreenings([], [makeScreening('A')])).toHaveLength(0);
  });

  it('deduplicates screenings by film+cinema+time', () => {
    const films = [makeFilm('inception', 'Inception', 2010)];
    const screenings = [
      makeScreening('Inception', 2010),
      makeScreening('Inception', 2010), // same cinema, same time
    ];
    const result = findExploreMatchingScreenings(films, screenings);

    expect(result).toHaveLength(1);
  });
});
