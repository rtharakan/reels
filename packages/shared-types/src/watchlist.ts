import type { FilmPreview } from './user';

export type ImportResult = {
  totalScraped: number;
  totalResolved: number;
  totalUnresolved: number;
  isEligibleForMatching: boolean;
};

export type EnhancedImportResult = ImportResult & {
  watchedCount: number;
  ratedCount: number;
  likedCount: number;
};

export type PaginatedWatchlist = {
  items: WatchlistItem[];
  nextCursor: string | null;
  totalCount: number;
};

export type WatchlistItem = {
  id: string;
  film: FilmPreview;
  importedAt: string;
};

export type RatedFilmItem = WatchlistItem & {
  rating: number;
};
