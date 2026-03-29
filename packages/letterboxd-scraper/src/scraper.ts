import * as cheerio from 'cheerio';

const USER_AGENT = 'Reels/1.0 (film-matching-app)';
const LETTERBOXD_BASE = 'https://letterboxd.com';
const POLITE_DELAY_MS = 500;
const MAX_CONCURRENT = 2;

export type ScrapedFilm = {
  slug: string;
  title: string;
  letterboxdId: string;
};

export type ScrapeResult = {
  films: ScrapedFilm[];
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
