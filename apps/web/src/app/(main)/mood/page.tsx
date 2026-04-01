'use client';

import { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { MoodSelector, type MoodType } from '@/components/mood/mood-selector';
import { FilmSuggestionCard } from '@/components/mood/film-suggestion-card';
import { MoodTwinsSection } from '@/components/mood/mood-twins-section';

interface Suggestion {
  id: string;
  filmId: string;
  filmTitle: string;
  filmYear: number | null;
  filmPosterPath: string | null;
  mood: string;
  matchExplanation: string;
  matchStrength: number;
  source: 'community' | 'ai';
}

interface MoodTwin {
  userId: string;
  displayName: string | null;
  image: string | null;
  sharedFilmCount: number;
  mood: string;
}

export default function MoodPage() {
  const { t } = useI18n();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [moodTwins, setMoodTwins] = useState<MoodTwin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setMoodMutation = trpc.mood.setMood.useMutation();

  // Use existing data if no new selection
  const displaySuggestions = suggestions;
  const displayTwins = moodTwins;

  const handleSelectMood = async (mood: MoodType) => {
    setSelectedMood(mood);
    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(() => {
      // Handled below
    }, 5000);
    timeoutRef.current = timeoutId;

    try {
      // Try authenticated setMood first (persists mood + gets community data)
      let result: { suggestions: unknown[]; moodTwins: unknown[] } | null = null;
      try {
        const authResult = await setMoodMutation.mutateAsync({ mood });
        result = authResult;
      } catch {
        // Not authenticated — use public explore endpoint
      }

      if (!result || (result.suggestions.length === 0)) {
        // Fallback to public explore (HuggingFace AI + TMDB, no auth needed)
        const publicResult = await trpcExplore(mood);
        result = publicResult ?? result ?? { suggestions: [], moodTwins: [] };
      }

      clearTimeout(timeoutId);
      setSuggestions((result?.suggestions ?? []) as Suggestion[]);
      setMoodTwins((result?.moodTwins ?? []) as MoodTwin[]);
    } catch {
      clearTimeout(timeoutId);
      setError(t.mood.retryButton);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to call the public mood.explore endpoint
  const exploreMood = trpc.mood.explore.useQuery(
    { mood: selectedMood! },
    { enabled: false },
  );

  async function trpcExplore(mood: MoodType) {
    try {
      // Use fetch directly to avoid hook rules — call the public explore endpoint
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const res = await fetch(`${baseUrl}/api/trpc/mood.explore?input=${encodeURIComponent(JSON.stringify({ mood }))}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data?.result?.data ?? null;
    } catch {
      return null;
    }
  }

  // Suppress unused var warning — exploreMood ref kept for potential future use
  void exploreMood;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 mb-3">
          {t.mood.betaBadge}
        </span>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-[var(--accent)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t.mood.title} <span className="text-[var(--accent)]">{t.mood.titleAccent}</span>
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{t.mood.subtitle}</p>
      </div>

      {/* Mood Selector Grid */}
      <div className="mb-8">
        <MoodSelector
          selectedMood={selectedMood}
          onSelect={handleSelectMood}
          isLoading={isLoading}
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3 mb-8">
          <p className="text-sm text-[var(--text-muted)] text-center">{t.mood.loadingSuggestions}</p>
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-[var(--bg-accent)] rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={() => selectedMood && handleSelectMood(selectedMood)}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            {t.mood.retryButton}
          </button>
        </div>
      )}

      {/* Suggestions */}
      {!isLoading && displaySuggestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{t.mood.suggestions}</h2>
          <div className="space-y-3">
            {displaySuggestions.map((s) => (
              <FilmSuggestionCard
                key={s.id}
                filmTitle={s.filmTitle}
                filmYear={s.filmYear}
                filmPosterPath={s.filmPosterPath}
                matchExplanation={s.matchExplanation}
                matchStrength={s.matchStrength}
                source={s.source}
              />
            ))}
          </div>
        </div>
      )}

      {/* No suggestions yet */}
      {!isLoading && displaySuggestions.length === 0 && !error && (
        <p className="text-sm text-[var(--text-muted)] text-center py-8 mb-8">{t.mood.noSuggestions}</p>
      )}

      {/* Mood Twins */}
      {!isLoading && (selectedMood || displayTwins.length > 0) && (
        <div className="mb-8">
          <MoodTwinsSection twins={displayTwins} />
        </div>
      )}

      {/* Mood History link */}
      <div className="text-center">
        <a href="/mood/history" className="text-sm text-[var(--accent)] hover:underline">
          {t.mood.viewHistory}
        </a>
      </div>
    </div>
  );
}
