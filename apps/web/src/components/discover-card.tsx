'use client';

import Image from 'next/image';
import { Film, Info } from 'lucide-react';
import { UserOverflowMenu } from './user-overflow-menu';

interface DiscoverCardFilm {
  id: string;
  title: string;
  posterUrl?: string | null;
}

interface DiscoverCardPrompt {
  question: string;
  answer: string;
}

export interface DiscoverCardData {
  userId: string;
  name: string;
  age: number;
  location: string;
  bio: string | null;
  intent: string;
  matchScore: number;
  sharedFilmCount: number;
  sharedFilms: DiscoverCardFilm[];
  prompts: DiscoverCardPrompt[];
  profilePhotos: string[];
}

interface DiscoverCardProps {
  card: DiscoverCardData;
  onInterest: () => void;
  onSkip: () => void;
  onProfileTap?: () => void;
  isInterestPending?: boolean;
  isSkipPending?: boolean;
}

function getIntentLabel(intent: string) {
  switch (intent) {
    case 'FRIENDS': return 'Friends';
    case 'DATING': return 'Dating';
    case 'BOTH': return 'Friends & Dating';
    default: return intent;
  }
}

function getScoreExplanation(score: number, sharedCount: number): string {
  if (score >= 0.5) return `A rare cinematic soulmate — ${sharedCount} films in common across watchlists, likes, and ratings.`;
  if (score >= 0.3) return `A genuine connection. You share ${sharedCount} films and deeply overlapping taste.`;
  if (score >= 0.15) return `${sharedCount} shared films and a similar sensibility. Worth exploring.`;
  if (score >= 0.05) return `${sharedCount} films in common — you might discover something new through their lens.`;
  return `Different corners of cinema — ${sharedCount} overlapping films. Sometimes contrast is the best conversation.`;
}

export function DiscoverCard({ card, onInterest, onSkip, onProfileTap, isInterestPending, isSkipPending }: DiscoverCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden shadow-soft card-transition">
      {/* Profile photo */}
      <div
        className="relative h-72 bg-[var(--bg-accent)] cursor-pointer"
        onClick={onProfileTap}
        role="button"
        tabIndex={0}
        aria-label={`View ${card.name}'s full profile`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onProfileTap?.(); } }}
      >
        {card.profilePhotos[0] ? (
          <Image src={card.profilePhotos[0]} alt={`${card.name}'s profile photo`} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-[var(--text-muted)]">
            {card.name.charAt(0)}
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-card)] p-4">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">{card.name}, {card.age}</h2>
          <p className="text-sm text-[var(--text-secondary)]">{card.location}</p>
        </div>

        {/* Overflow menu */}
        <div className="absolute top-3 right-3">
          <UserOverflowMenu targetUserId={card.userId} targetUserName={card.name} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Intent badge + match score */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex rounded-full bg-[var(--bg-accent)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
            {getIntentLabel(card.intent)}
          </span>
          <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]">
            {Math.round(card.matchScore * 100)}% match
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {card.sharedFilmCount} shared films
          </span>
        </div>

        {/* Score explanation */}
        <div className="flex items-start gap-2 rounded-xl bg-[var(--bg-accent)] p-3">
          <Info className="h-3.5 w-3.5 text-[var(--accent)] mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {getScoreExplanation(card.matchScore, card.sharedFilmCount)}
          </p>
        </div>

        {/* Bio */}
        {card.bio && <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{card.bio}</p>}

        {/* Prompts */}
        {card.prompts.length > 0 && (
          <div className="space-y-2">
            {card.prompts.slice(0, 2).map((p, i) => (
              <div key={i} className="rounded-xl bg-[var(--bg-accent)] p-3">
                <p className="text-xs text-[var(--text-muted)] mb-0.5">{p.question}</p>
                <p className="text-sm text-[var(--text-primary)]">{p.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Shared films */}
        {card.sharedFilms.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Films you both love</h3>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {card.sharedFilms.map((film) => (
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

      {/* Action buttons */}
      <div className="flex border-t border-[var(--border-default)]">
        <button
          onClick={onSkip}
          disabled={isSkipPending}
          className="flex-1 py-4 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)] transition-all active:scale-[0.98] disabled:opacity-50"
          aria-label={`Skip ${card.name}`}
        >
          Skip
        </button>
        <div className="w-px bg-[var(--border-default)]" aria-hidden="true" />
        <button
          onClick={onInterest}
          disabled={isInterestPending}
          className="flex-1 py-4 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all active:scale-[0.98] disabled:opacity-50"
          aria-label={`Express interest in ${card.name}`}
        >
          Interested
        </button>
      </div>
    </div>
  );
}
