'use client';

import { useState, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import Image from 'next/image';
import { Film, Info } from 'lucide-react';

function getIntentLabel(intent: string) {
  switch (intent) {
    case 'FRIENDS': return 'Friends';
    case 'DATING': return 'Dating';
    case 'BOTH': return 'Friends & Dating';
    default: return intent;
  }
}

function getScoreExplanation(score: number, sharedCount: number): string {
  if (score >= 0.5) return `You and this person are a rare match — ${sharedCount} films in common across your watchlists, likes, and ratings.`;
  if (score >= 0.3) return `Strong connection! You share ${sharedCount} films and similar genre tastes.`;
  if (score >= 0.15) return `You have ${sharedCount} shared films and overlapping genres.`;
  if (score >= 0.05) return `Some overlap with ${sharedCount} shared films. You might discover new favorites together.`;
  return `Different tastes can spark great conversations — ${sharedCount} films overlap.`;
}

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAlert, setMatchAlert] = useState<string | null>(null);

  const { data: feed, isLoading, refetch } = trpc.discover.getFeed.useQuery();
  const expressInterest = trpc.discover.expressInterest.useMutation();
  const skip = trpc.discover.skip.useMutation();

  const handleInterest = useCallback(async () => {
    if (!feed?.cards[currentIndex]) return;
    const card = feed.cards[currentIndex];
    try {
      const result = await expressInterest.mutateAsync({ targetUserId: card.userId });
      if (result.isMatch) {
        setMatchAlert(`It's a match with ${card.name}! 🎬`);
        setTimeout(() => setMatchAlert(null), 3000);
      }
    } catch { /* handled by UI */ }
    setCurrentIndex((i) => i + 1);
  }, [feed, currentIndex, expressInterest]);

  const handleSkip = useCallback(async () => {
    if (!feed?.cards[currentIndex]) return;
    const card = feed.cards[currentIndex];
    try {
      await skip.mutateAsync({ targetUserId: card.userId });
    } catch { /* handled by UI */ }
    setCurrentIndex((i) => i + 1);
  }, [feed, currentIndex, skip]);

  // Keyboard shortcuts: ArrowLeft to skip, ArrowRight to express interest
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        handleSkip();
      } else if (e.key === 'ArrowRight') {
        handleInterest();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip, handleInterest]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="skeleton h-6 w-24 mb-6" />
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
          <div className="skeleton h-72" />
          <div className="p-4 space-y-3">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-3 w-48" />
            <div className="skeleton h-3 w-full" />
            <div className="flex gap-2">
              <div className="skeleton h-[120px] w-[80px]" />
              <div className="skeleton h-[120px] w-[80px]" />
              <div className="skeleton h-[120px] w-[80px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const card = feed?.cards[currentIndex];
  const isAllCaughtUp = !card || feed?.isAllCaughtUp;

  if (isAllCaughtUp) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl">🎬</p>
          <h1 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">All caught up</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Check back tomorrow for new matches
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">Discover</h1>

      {matchAlert && (
        <div className="mb-4 rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white shadow-soft" role="alert" aria-live="polite">
          {matchAlert}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden shadow-soft">
        {/* Profile photo */}
        <div className="relative h-72 bg-[var(--bg-accent)]">
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
            <Info className="h-3.5 w-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {getScoreExplanation(card.matchScore, card.sharedFilmCount)}
            </p>
          </div>

          {/* Bio */}
          {card.bio && <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{card.bio}</p>}

          {/* Prompts */}
          {card.prompts.length > 0 && (
            <div className="space-y-2">
              {card.prompts.slice(0, 2).map((p: { question: string; answer: string }, i: number) => (
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
                {card.sharedFilms.map((film: { id: string; title: string; posterUrl?: string | null }) => (
                  <div key={film.id} className="flex-shrink-0">
                    <div className="relative aspect-[2/3] w-[72px] overflow-hidden rounded-xl bg-[var(--bg-accent)]">
                      {film.posterUrl ? (
                        <Image src={film.posterUrl} alt={`${film.title} poster`} width={72} height={108} className="h-full w-full object-cover" unoptimized onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; const p = (e.target as HTMLImageElement).parentElement; if (p) { const fb = document.createElement('div'); fb.className = 'flex h-full flex-col items-center justify-center p-1 text-center'; const span = document.createElement('span'); span.className = 'text-[10px] text-[var(--text-muted)] line-clamp-3'; span.textContent = film.title; fb.appendChild(span); p.appendChild(fb); } }} />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-1 text-center">
                          <Film className="h-4 w-4 text-[var(--text-muted)] mb-1" />
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
          <button onClick={handleSkip} disabled={skip.isPending}
            className="flex-1 py-4 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-accent)] hover:text-[var(--text-primary)] transition-all active:scale-[0.98]"
            aria-label="Skip this person">
            Skip
          </button>
          <div className="w-px bg-[var(--border-default)]" />
          <button onClick={handleInterest} disabled={expressInterest.isPending}
            className="flex-1 py-4 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-all active:scale-[0.98]"
            aria-label="Express interest in this person">
            Interested
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
        {feed?.remainingToday ?? 0} cards remaining today
      </p>
    </div>
  );
}
