import * as cheerio from 'cheerio';

const USER_AGENT = 'Reels/1.0 (film-matching-app)';
const LETTERBOXD_BASE = 'https://letterboxd.com';
const POLITE_DELAY_MS = 500;

export type ScrapedFilm = {
  slug: string;
  title: string;
  letterboxdId: string;
};

export type ScrapedRatedFilm = ScrapedFilm & {
  rating: number; // 0.5–5.0 in half-star increments
};

export type ScrapeResult = {
  films: ScrapedFilm[];
  isPrivate: boolean;
  error?: string;
};

export type RatedScrapeResult = {
  films: ScrapedRatedFilm[];
  isPrivate: boolean;
  error?: string;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(url: string): Promise<{ status: number; html: string }> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'manual',
  });
  const html = await res.text();
  return { status: res.status, html };
}

function extractFilmsFromPage(html: string): ScrapedFilm[] {
  const $ = cheerio.load(html);
  const films: ScrapedFilm[] = [];

  // New Letterboxd structure: react-component LazyPoster with data-item-slug
  $('div.react-component[data-component-class="LazyPoster"]').each((_, el) => {
    const $el = $(el);
    const slug = $el.attr('data-item-slug') ?? '';
    const letterboxdId = $el.attr('data-film-id') ?? '';
    const title = $el.attr('data-item-name') ?? $el.find('img').attr('alt') ?? slug;

    if (slug) {
      films.push({ slug, title, letterboxdId });
    }
  });

  // Fallback: legacy structure (li.poster-container)
  if (films.length === 0) {
    $('li.poster-container').each((_, el) => {
      const poster = $(el).find('div.film-poster');
      const slug = poster.attr('data-film-slug') ?? '';
      const letterboxdId = poster.attr('data-film-id') ?? '';
      const img = poster.find('img');
      const title = img.attr('alt') ?? slug;

      if (slug) {
        films.push({ slug, title, letterboxdId });
      }
    });
  }

  return films;
}

function getPageCount(html: string): number {
  const $ = cheerio.load(html);
  const pages = $('li.paginate-page');
  if (pages.length === 0) return 1;
  const lastPage = pages.last().text().trim();
  return parseInt(lastPage, 10) || 1;
}

export async function scrapeWatchlist(username: string): Promise<ScrapeResult> {
  const baseUrl = `${LETTERBOXD_BASE}/${encodeURIComponent(username)}/watchlist`;

  // Fetch first page
  const firstPage = await fetchPage(`${baseUrl}/page/1/`);

  // Check for private/not-found
  if (firstPage.status === 404 || firstPage.status === 302) {
    // Try to distinguish between not found and private
    const $ = cheerio.load(firstPage.html);
    const bodyText = $.text().toLowerCase();
    if (bodyText.includes('private') || bodyText.includes('not found')) {
      return {
        films: [],
        isPrivate: true,
        error: firstPage.status === 404 ? 'Username not found' : 'This profile is private',
      };
    }
    return { films: [], isPrivate: true, error: 'Username not found' };
  }

  if (firstPage.status !== 200) {
    return { films: [], isPrivate: false, error: `Letterboxd returned status ${firstPage.status}` };
  }

  const allFilms: ScrapedFilm[] = extractFilmsFromPage(firstPage.html);
  const totalPages = getPageCount(firstPage.html);

  // Fetch remaining pages with polite delay
  for (let page = 2; page <= totalPages; page++) {
    await delay(POLITE_DELAY_MS);
    try {
      const result = await fetchPage(`${baseUrl}/page/${page}/`);
      if (result.status === 200) {
        allFilms.push(...extractFilmsFromPage(result.html));
      }
    } catch {
      // Continue with what we have
    }
  }

  return { films: allFilms, isPrivate: false };
}

/**
 * Scrape a user's watched films (diary/activity).
 * Letterboxd URL: /{username}/films/
 */
export async function scrapeFilms(username: string): Promise<ScrapeResult> {
  const baseUrl = `${LETTERBOXD_BASE}/${encodeURIComponent(username)}/films`;

  const firstPage = await fetchPage(`${baseUrl}/page/1/`);

  if (firstPage.status === 404 || firstPage.status === 302) {
    const $ = cheerio.load(firstPage.html);
    const bodyText = $.text().toLowerCase();
    if (bodyText.includes('private') || bodyText.includes('not found')) {
      return {
        films: [],
        isPrivate: true,
        error: firstPage.status === 404 ? 'Username not found' : 'This profile is private',
      };
    }
    return { films: [], isPrivate: true, error: 'Username not found' };
  }

  if (firstPage.status !== 200) {
    return { films: [], isPrivate: false, error: `Letterboxd returned status ${firstPage.status}` };
  }

  const allFilms: ScrapedFilm[] = extractFilmsFromPage(firstPage.html);
  const totalPages = getPageCount(firstPage.html);

  for (let page = 2; page <= totalPages; page++) {
    await delay(POLITE_DELAY_MS);
    try {
      const result = await fetchPage(`${baseUrl}/page/${page}/`);
      if (result.status === 200) {
        allFilms.push(...extractFilmsFromPage(result.html));
      }
    } catch {
      // Continue with what we have
    }
  }

  return { films: allFilms, isPrivate: false };
}

/**
 * Extract rated films from a Letterboxd ratings page.
 * Ratings page shows film posters with a star-rating overlay.
 */
function extractRatedFilmsFromPage(html: string): ScrapedRatedFilm[] {
  const $ = cheerio.load(html);
  const films: ScrapedRatedFilm[] = [];

  // New Letterboxd structure: react-component LazyPoster
  $('div.react-component[data-component-class="LazyPoster"]').each((_, el) => {
    const $el = $(el);
    const slug = $el.attr('data-item-slug') ?? '';
    const letterboxdId = $el.attr('data-film-id') ?? '';
    const title = $el.attr('data-item-name') ?? $el.find('img').attr('alt') ?? slug;

    const ratingEl = $el.parent().find('span.rating');
    let rating = 0;
    if (ratingEl.length > 0) {
      const classes = ratingEl.attr('class') ?? '';
      const ratingMatch = classes.match(/rated-(\d+)/);
      if (ratingMatch) {
        rating = parseInt(ratingMatch[1]!, 10) / 2;
      }
    }

    if (slug && rating > 0) {
      films.push({ slug, title, letterboxdId, rating });
    }
  });

  // Fallback: legacy structure (li.poster-container)
  if (films.length === 0) {
    $('li.poster-container').each((_, el) => {
      const poster = $(el).find('div.film-poster');
      const slug = poster.attr('data-film-slug') ?? '';
      const letterboxdId = poster.attr('data-film-id') ?? '';
      const img = poster.find('img');
      const title = img.attr('alt') ?? slug;

      const ratingEl = $(el).find('span.rating');
      let rating = 0;
      if (ratingEl.length > 0) {
        const classes = ratingEl.attr('class') ?? '';
        const ratingMatch = classes.match(/rated-(\d+)/);
        if (ratingMatch) {
          rating = parseInt(ratingMatch[1]!, 10) / 2;
        }
      }

      if (slug && rating > 0) {
        films.push({ slug, title, letterboxdId, rating });
      }
    });
  }

  return films;
}

/**
 * Scrape a user's rated films with their ratings.
 * Letterboxd URL: /{username}/films/ratings/
 */
export async function scrapeRatings(username: string): Promise<RatedScrapeResult> {
  const baseUrl = `${LETTERBOXD_BASE}/${encodeURIComponent(username)}/films/ratings`;

  const firstPage = await fetchPage(`${baseUrl}/page/1/`);

  if (firstPage.status === 404 || firstPage.status === 302) {
    const $ = cheerio.load(firstPage.html);
    const bodyText = $.text().toLowerCase();
    if (bodyText.includes('private') || bodyText.includes('not found')) {
      return {
        films: [],
        isPrivate: true,
        error: firstPage.status === 404 ? 'Username not found' : 'This profile is private',
      };
    }
    return { films: [], isPrivate: true, error: 'Username not found' };
  }

  if (firstPage.status !== 200) {
    return { films: [], isPrivate: false, error: `Letterboxd returned status ${firstPage.status}` };
  }

  const allFilms: ScrapedRatedFilm[] = extractRatedFilmsFromPage(firstPage.html);
  const totalPages = getPageCount(firstPage.html);

  for (let page = 2; page <= totalPages; page++) {
    await delay(POLITE_DELAY_MS);
    try {
      const result = await fetchPage(`${baseUrl}/page/${page}/`);
      if (result.status === 200) {
        allFilms.push(...extractRatedFilmsFromPage(result.html));
      }
    } catch {
      // Continue with what we have
    }
  }

  return { films: allFilms, isPrivate: false };
}

/**
 * Scrape a user's liked films.
 * Letterboxd URL: /{username}/likes/films/
 */
export async function scrapeLikes(username: string): Promise<ScrapeResult> {
  const baseUrl = `${LETTERBOXD_BASE}/${encodeURIComponent(username)}/likes/films`;

  const firstPage = await fetchPage(`${baseUrl}/page/1/`);

  if (firstPage.status === 404 || firstPage.status === 302) {
    const $ = cheerio.load(firstPage.html);
    const bodyText = $.text().toLowerCase();
    if (bodyText.includes('private') || bodyText.includes('not found')) {
      return {
        films: [],
        isPrivate: true,
        error: firstPage.status === 404 ? 'Username not found' : 'This profile is private',
      };
    }
    return { films: [], isPrivate: true, error: 'Username not found' };
  }

  if (firstPage.status !== 200) {
    return { films: [], isPrivate: false, error: `Letterboxd returned status ${firstPage.status}` };
  }

  const allFilms: ScrapedFilm[] = extractFilmsFromPage(firstPage.html);
  const totalPages = getPageCount(firstPage.html);

  for (let page = 2; page <= totalPages; page++) {
    await delay(POLITE_DELAY_MS);
    try {
      const result = await fetchPage(`${baseUrl}/page/${page}/`);
      if (result.status === 200) {
        allFilms.push(...extractFilmsFromPage(result.html));
      }
    } catch {
      // Continue with what we have
    }
  }

  return { films: allFilms, isPrivate: false };
}
