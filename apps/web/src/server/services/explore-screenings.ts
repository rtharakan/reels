/**
 * Filmladder screening fetcher for Explore date planner.
 * Adapted from https://github.com/rtharakan/letterboxd-watchlist
 * Fetches current screenings in Dutch cities from Filmladder.nl
 */

const FILMLADDER_BASE_URL = 'https://www.filmladder.nl';
const USER_AGENT =
  'Mozilla/5.0 (compatible; ReelsExplore/1.0; +https://github.com/rtharakan/reels)';

export interface ExploreScreening {
  filmTitle: string;
  filmYear?: number;
  cinemaName: string;
  cinemaCity: string;
  date: string;
  time: string;
  ticketUrl?: string;
}

export interface ExploreCity {
  slug: string;
  name: string;
}

export const DUTCH_CITIES: ExploreCity[] = [
  { slug: 'amsterdam', name: 'Amsterdam' },
  { slug: 'rotterdam', name: 'Rotterdam' },
  { slug: 'den-haag', name: 'Den Haag' },
  { slug: 'utrecht', name: 'Utrecht' },
  { slug: 'eindhoven', name: 'Eindhoven' },
  { slug: 'groningen', name: 'Groningen' },
  { slug: 'haarlem', name: 'Haarlem' },
  { slug: 'leiden', name: 'Leiden' },
  { slug: 'nijmegen', name: 'Nijmegen' },
  { slug: 'arnhem', name: 'Arnhem' },
  { slug: 'maastricht', name: 'Maastricht' },
  { slug: 'breda', name: 'Breda' },
  { slug: 'tilburg', name: 'Tilburg' },
  { slug: 'delft', name: 'Delft' },
  { slug: 'deventer', name: 'Deventer' },
  { slug: 'den-bosch', name: "'s-Hertogenbosch" },
  { slug: 'leeuwarden', name: 'Leeuwarden' },
  { slug: 'zwolle', name: 'Zwolle' },
];

interface FilmInfo {
  title: string;
  slug: string;
  year?: number;
}

function extractFilmsFromListingPage(html: string): FilmInfo[] {
  const films: FilmInfo[] = [];
  const moviePattern =
    /<li[^>]*class="movie"[^>]*data-name="([^"]+)"[^>]*>[\s\S]*?href="[^"]*\/film\/([^/]+)\/popup[^"]*"[\s\S]*?<\/li>/g;

  let match;
  while ((match = moviePattern.exec(html)) !== null) {
    const rawTitle = match[1];
    const rawSlug = match[2];
    if (!rawTitle || !rawSlug) continue;
    const title = rawTitle
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
    const slug = rawSlug;
    const yearMatch = slug.match(/-(\d{4})$/);
    const year = yearMatch?.[1] ? parseInt(yearMatch[1], 10) : undefined;
    films.push({ title, slug, year });
  }

  return films;
}

async function fetchFilmScreeningsFromFilmladder(
  filmSlug: string,
  filmTitle: string,
  filmYear: number | undefined,
  city: string
): Promise<ExploreScreening[]> {
  const screenings: ExploreScreening[] = [];

  try {
    const url = `${FILMLADDER_BASE_URL}/film/${filmSlug}/bioscopen/${city}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
      },
      cache: 'no-store',
    });

    if (!response.ok) return screenings;

    const html = await response.text();

    // Parse cinema blocks with screening times
    const cinemaPattern =
      /<a[^>]*title="([^"]+)"[^>]*class="[^"]*cinema-link[^"]*"[^>]*>/g;
    const cinemaSections: { name: string; html: string }[] = [];
    let lastIndex = 0;
    let lastCinemaName = '';

    let cinemaMatch;
    while ((cinemaMatch = cinemaPattern.exec(html)) !== null) {
      if (lastCinemaName && lastIndex > 0) {
        cinemaSections.push({
          name: lastCinemaName,
          html: html.slice(lastIndex, cinemaMatch.index),
        });
      }
      lastCinemaName = cinemaMatch[1] ?? '';
      lastIndex = cinemaMatch.index;
    }

    if (lastCinemaName && lastIndex > 0) {
      cinemaSections.push({
        name: lastCinemaName,
        html: html.slice(lastIndex),
      });
    }

    for (const section of cinemaSections) {
      const screeningPattern =
        /<div[^>]*itemprop="startDate"[^>]*content="(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}):\d{2}[^"]*"[^>]*>[\s\S]*?href="(https:\/\/www\.filmladder\.nl\/kaartjes\/\d+)"[^>]*>/g;

      let screeningMatch;
      while (
        (screeningMatch = screeningPattern.exec(section.html)) !== null
      ) {
        const date = screeningMatch[1];
        const time = screeningMatch[2];
        const ticketUrl = screeningMatch[3];
        if (!date || !time) continue;
        screenings.push({
          filmTitle,
          filmYear,
          cinemaName: section.name,
          cinemaCity: city,
          date,
          time,
          ticketUrl,
        });
      }
    }
  } catch (error) {
    console.error(
      `[Filmladder] Error fetching screenings for ${filmTitle}:`,
      error
    );
  }

  return screenings;
}

export async function fetchCityScreenings(
  city: string
): Promise<ExploreScreening[]> {
  const slug =
    DUTCH_CITIES.find((c) => c.slug === city)?.slug || city;
  const url = `${FILMLADDER_BASE_URL}/${slug}/films`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Filmladder: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const films = extractFilmsFromListingPage(html);
  const allScreenings: ExploreScreening[] = [];

  // Limit to first 30 films to avoid excessive requests
  const filmsToFetch = films.slice(0, 30);

  // Parallel batching: 5 concurrent requests with 500ms delay between batches
  const BATCH_SIZE = 5;
  for (let i = 0; i < filmsToFetch.length; i += BATCH_SIZE) {
    const batch = filmsToFetch.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((film) =>
        fetchFilmScreeningsFromFilmladder(film.slug, film.title, film.year, city)
      )
    );
    for (const results of batchResults) {
      allScreenings.push(...results);
    }
    // Rate limiting between batches (skip after last batch)
    if (i + BATCH_SIZE < filmsToFetch.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // Filter to next 14 days AND only future showtimes
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  return allScreenings
    .filter((s) => {
      const d = new Date(s.date + 'T00:00:00');
      if (d < today || d > maxDate) return false;
      // For today's screenings, only show future times
      const screeningDateTime = new Date(`${s.date}T${s.time}:00`);
      return screeningDateTime > now;
    })
    .sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date);
      if (dateDiff !== 0) return dateDiff;
      return a.time.localeCompare(b.time);
    });
}
