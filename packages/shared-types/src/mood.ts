// Mood Reels types — platform-agnostic (no Prisma dependency)

export type MoodType =
  | 'NOSTALGIC'
  | 'ADVENTUROUS'
  | 'HEARTBROKEN'
  | 'HYPE'
  | 'CHILL'
  | 'ROMANTIC'
  | 'MYSTERIOUS'
  | 'INSPIRED'
  | 'MELANCHOLIC'
  | 'COZY';

export interface UserMood {
  id: string;
  userId: string;
  mood: MoodType;
  isActive: boolean;
  selectedAt: string;
}

export interface MoodFilmSuggestion {
  id: string;
  userId: string;
  filmId: string;
  mood: MoodType;
  matchExplanation: string;
  matchStrength: number;
  source: 'community' | 'ai';
  createdAt: string;
}

export interface MoodFilmTag {
  id: string;
  filmId: string;
  mood: MoodType;
  taggedById: string;
  createdAt: string;
}
