'use client';

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import Image from 'next/image';

function getIntentLabel(intent: string) {
  switch (intent) {
    case 'FRIENDS': return 'Looking for friends';
    case 'DATING': return 'Looking to date';
    case 'BOTH': return 'Open to friends & dating';
    default: return intent;
  }
}

function getIntentVariant(intent: string) {
  switch (intent) {
    case 'FRIENDS': return 'bg-emerald-50 text-stone-600';
    case 'DATING': return 'bg-emerald-50 text-stone-600';
    default: return 'bg-emerald-50 text-stone-600';
  }
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

  // Keyboard shortcuts
  if (typeof window !== 'undefined') {
    // Using effect-free approach for SSR safety
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      </div>
    );
  }

  const card = feed?.cards[currentIndex];
  const isAllCaughtUp = !card || feed?.isAllCaughtUp;

  if (isAllCaughtUp) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl">🎬</p>
          <h1 className="mt-4 text-xl font-bold text-stone-800">You&apos;re all caught up!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Check back tomorrow for more matches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-xl font-bold text-stone-800">Discover</h1>

      {matchAlert && (
        <div className="mb-4 rounded-lg bg-teal-400 px-4 py-3 text-center text-sm font-medium text-stone-800" role="alert" aria-live="polite">
          {matchAlert}
        </div>
      )}

      <div className="rounded-xl border border-emerald-100 bg-white overflow-hidden">
        {/* Profile photo */}
        <div className="relative h-72 bg-emerald-50">
          {card.profilePhotos[0] ? (
            <Image src={card.profilePhotos[0]} alt={`${card.name}'s profile photo`} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl text-slate-300">
              {card.name.charAt(0)}
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white p-4">
            <h2 className="text-xl font-bold text-stone-800">{card.name}, {card.age}</h2>
            <p className="text-sm text-stone-500">{card.location}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Intent badge */}
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getIntentVariant(card.intent)}`}>
            {getIntentLabel(card.intent)}
          </span>

          {/* Match info */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-stone-800">{Math.round(card.matchScore * 100)}% match</span>
            <span>·</span>
            <span>{card.sharedFilmCount} shared films</span>
          </div>

          {/* Bio */}
          {card.bio && <p className="text-sm text-stone-500">{card.bio}</p>}

          {/* Prompts */}
          {card.prompts.length > 0 && (
            <div className="space-y-2">
              {card.prompts.slice(0, 2).map((p, i) => (
                <div key={i} className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-xs text-slate-400">{p.question}</p>
                  <p className="text-sm text-stone-600">{p.answer}</p>
                </div>
              ))}
            </div>
          )}

          {/* Shared films */}
          {card.sharedFilms.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-500">Films you both love</h3>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {card.sharedFilms.map((film) => (
                  <div key={film.id} className="flex-shrink-0">
                    {film.posterUrl ? (
                      <div className="aspect-[2/3] w-[80px] overflow-hidden rounded-lg">
                        <Image src={film.posterUrl} alt={`${film.title} poster`} width={80} height={120} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-[120px] w-[80px] items-center justify-center rounded-lg bg-emerald-50 text-xs text-slate-400 p-1 text-center">
                        {film.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex border-t border-emerald-100">
          <button onClick={handleSkip} disabled={skip.isPending}
            className="flex-1 py-4 text-sm font-medium text-slate-500 hover:bg-emerald-50 hover:text-stone-800 transition-colors"
            aria-label="Skip this person">
            Skip
          </button>
          <div className="w-px bg-emerald-50" />
          <button onClick={handleInterest} disabled={expressInterest.isPending}
            className="flex-1 py-4 text-sm font-medium text-stone-600 hover:bg-emerald-50 hover:text-stone-800 transition-colors"
            aria-label="Express interest in this person">
            Interested ❤️
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-300">
        {feed?.remainingToday ?? 0} cards remaining today
      </p>
    </div>
  );
}
