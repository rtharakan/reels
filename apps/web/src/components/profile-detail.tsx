'use client';

import Image from 'next/image';
import { Film } from 'lucide-react';
import { UserOverflowMenu } from './user-overflow-menu';

interface ProfileFilm {
  id: string;
  title: string;
  posterUrl?: string | null;
}

interface ProfilePrompt {
  question: string;
  answer: string;
}

export interface ProfileDetailData {
  userId: string;
  name: string;
  age: number;
  location: string;
  bio: string | null;
  intent: string;
  prompts: ProfilePrompt[];
  topFilms: ProfileFilm[];
  sharedFilms: ProfileFilm[];
  matchScore: number;
  sharedFilmCount: number;
  profilePhotos: string[];
}

interface ProfileDetailProps {
  profile: ProfileDetailData;
  onClose: () => void;
}

function getIntentLabel(intent: string) {
  switch (intent) {
    case 'FRIENDS': return 'Friends';
    case 'DATING': return 'Dating';
    case 'BOTH': return 'Friends & Dating';
    default: return intent;
  }
}

export function ProfileDetail({ profile, onClose }: ProfileDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-detail-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-soft-lg">
        {/* Header with photo */}
        <div className="relative h-64 bg-[var(--bg-accent)]">
          {profile.profilePhotos[0] ? (
            <Image src={profile.profilePhotos[0]} alt={`${profile.name}'s photo`} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-[var(--text-muted)]">
              {profile.name.charAt(0)}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-card)] p-4">
            <h2 id="profile-detail-title" className="text-xl font-semibold text-[var(--text-primary)]">
              {profile.name}, {profile.age}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{profile.location}</p>
          </div>

          {/* Close and overflow */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <UserOverflowMenu targetUserId={profile.userId} targetUserName={profile.name} />
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors"
              aria-label="Close profile"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Intent + Score */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex rounded-full bg-[var(--bg-accent)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
              {getIntentLabel(profile.intent)}
            </span>
            <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
              {Math.round(profile.matchScore * 100)}% match
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {profile.sharedFilmCount} shared films
            </span>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{profile.bio}</p>
          )}

          {/* Prompts */}
          {profile.prompts.length > 0 && (
            <div className="space-y-2">
              {profile.prompts.map((p, i) => (
                <div key={i} className="rounded-xl bg-[var(--bg-accent)] p-3">
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">{p.question}</p>
                  <p className="text-sm text-[var(--text-primary)]">{p.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Top films */}
          {profile.topFilms.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Top films</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {profile.topFilms.map((film) => (
                  <div key={film.id} className="flex-shrink-0">
                    <div className="relative aspect-[2/3] w-[72px] overflow-hidden rounded-xl bg-[var(--bg-accent)]">
                      {film.posterUrl ? (
                        <Image src={film.posterUrl} alt={`${film.title} poster`} width={72} height={108} className="h-full w-full object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-1 text-center">
                          <Film className="h-4 w-4 text-[var(--text-muted)] mb-1" aria-hidden="true" />
                          <span className="text-[10px] text-[var(--text-muted)] line-clamp-3">{film.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared films */}
          {profile.sharedFilms.length > 0 && (
            <div>
              <h3 className="mb-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Films you both love</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {profile.sharedFilms.map((film) => (
                  <div key={film.id} className="flex-shrink-0">
                    <div className="relative aspect-[2/3] w-[72px] overflow-hidden rounded-xl bg-[var(--bg-accent)]">
                      {film.posterUrl ? (
                        <Image src={film.posterUrl} alt={`${film.title} poster`} width={72} height={108} className="h-full w-full object-cover" unoptimized />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-1 text-center">
                          <Film className="h-4 w-4 text-[var(--text-muted)] mb-1" aria-hidden="true" />
                          <span className="text-[10px] text-[var(--text-muted)] line-clamp-3">{film.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
