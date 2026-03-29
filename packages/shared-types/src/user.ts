export type Intent = 'FRIENDS' | 'DATING' | 'BOTH';

export type UserProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string | null;
  intent: Intent;
  letterboxdUsername: string | null;
  profilePhotos: string[];
  prompts: { question: string; answer: string }[];
  topFilms: FilmPreview[];
  watchlistCount: number;
  isOnboarded: boolean;
  createdAt: string;
};

export type PublicProfile = {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string | null;
  intent: Intent;
  profilePhotos: string[];
  prompts: { question: string; answer: string }[];
  topFilms: FilmPreview[];
};

export type FilmPreview = {
  id: string;
  tmdbId: number | null;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genreIds: number[];
};

export type OnboardingInput = {
  name: string;
  age: number;
  location: string;
  bio: string;
  intent: Intent;
  letterboxdUsername?: string;
  prompts: { question: string; answer: string }[];
  topFilmIds?: string[];
  timezone: string;
};

export type UpdateProfileInput = Partial<{
  name: string;
  age: number;
  location: string;
  bio: string;
  intent: Intent;
  letterboxdUsername: string;
  prompts: { question: string; answer: string }[];
  topFilmIds: string[];
  profilePhotos: string[];
  timezone: string;
}>;
