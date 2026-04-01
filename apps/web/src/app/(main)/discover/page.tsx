'use client';

import { useState, useCallback, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { DiscoverCard } from '@/components/discover-card';
import { ProfileDetail } from '@/components/profile-detail';
import type { ProfileDetailData } from '@/components/profile-detail';
import { VibePrompt } from '@/components/mood/vibe-prompt';

export default function DiscoverPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchAlert, setMatchAlert] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ProfileDetailData | null>(null);

  const { data: feed, isLoading } = trpc.discover.getFeed.useQuery();
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
          <h1 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">You&apos;re all caught up</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Ten cinephiles a day — come back tomorrow for your next batch.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">Discover</h1>

      {/* Mood Reels vibe prompt */}
      <div className="mb-4">
        <VibePrompt />
      </div>

      {/* Accessible live region for match announcements */}
      <div aria-live="assertive" aria-atomic="true" role="status">
        {matchAlert && (
          <div className="mb-4 rounded-2xl bg-[var(--accent)] px-4 py-3 text-center text-sm font-medium text-white shadow-soft">
            {matchAlert}
          </div>
        )}
      </div>

      {/* Screen reader announcement for card transitions */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Now viewing {card.name}, {card.age} from {card.location}. {card.sharedFilmCount} shared films, {Math.round(card.matchScore * 100)}% match.
      </div>

      <DiscoverCard
        card={card}
        onInterest={handleInterest}
        onSkip={handleSkip}
        onProfileTap={() => setSelectedProfile({
          userId: card.userId,
          name: card.name,
          age: card.age,
          location: card.location,
          bio: card.bio,
          intent: card.intent,
          prompts: card.prompts,
          topFilms: [],
          sharedFilms: card.sharedFilms,
          matchScore: card.matchScore,
          sharedFilmCount: card.sharedFilmCount,
          profilePhotos: card.profilePhotos,
        })}
        isInterestPending={expressInterest.isPending}
        isSkipPending={skip.isPending}
      />

      <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
        {feed?.remainingToday ?? 0} cards remaining today · ← skip · → interested
      </p>

      {selectedProfile && (
        <ProfileDetail profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
      )}
    </div>
  );
}
