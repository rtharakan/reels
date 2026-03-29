import type { FilmPreview, Intent, PublicProfile } from './user';

export type DiscoverCard = {
  userId: string;
  name: string;
  age: number;
  location: string;
  bio: string | null;
  intent: Intent;
  profilePhotos: string[];
  prompts: { question: string; answer: string }[];
  topFilms: FilmPreview[];
  matchScore: number;
  sharedFilmCount: number;
  sharedFilms: FilmPreview[];
};

export type DiscoverFeed = {
  cards: DiscoverCard[];
  remainingToday: number;
  isAllCaughtUp: boolean;
};

export type InterestResult = {
  success: boolean;
  isMatch: boolean;
  matchId: string | null;
};

export type MatchListItem = {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    profilePhotos: string[];
  };
  sharedFilmCount: number;
  score: number;
  createdAt: string;
};

export type MatchDetail = {
  matchId: string;
  otherUser: PublicProfile;
  score: number;
  sharedFilms: FilmPreview[];
  genreOverlap: { genreName: string; count: number }[];
  createdAt: string;
};
