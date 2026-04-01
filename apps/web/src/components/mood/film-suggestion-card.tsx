'use client';

import Image from 'next/image';
import { useI18n } from '@/lib/i18n';

interface FilmSuggestionCardProps {
  filmTitle: string;
  filmYear: number | null;
  filmPosterPath: string | null;
  matchExplanation: string;
  matchStrength: number;
  source: 'community' | 'ai';
}

export function FilmSuggestionCard({
  filmTitle, filmYear, filmPosterPath,
  matchExplanation, matchStrength, source,
}: FilmSuggestionCardProps) {
  const { t } = useI18n();
  const strengthPercent = Math.round(matchStrength * 100);

  return (
    <div className="flex gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
      {filmPosterPath ? (
        <Image
          src={`https://image.tmdb.org/t/p/w154${filmPosterPath}`}
          alt={filmTitle}
          width={64}
          height={96}
          className="rounded-lg object-cover self-start"
        />
      ) : (
        <div className="h-24 w-16 rounded-lg bg-[var(--bg-accent)] flex items-center justify-center text-[var(--text-muted)] text-xs">
          🎬
        </div>
      )}
      <div className="flex-1 space-y-2">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {filmTitle}
            {filmYear && <span className="ml-1 text-[var(--text-muted)] font-normal">({filmYear})</span>}
          </h3>
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            source === 'ai'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
          }`}>
            {source === 'ai' ? t.mood.sourceAi : t.mood.sourceCommunity}
          </span>
        </div>
        <p className="text-xs text-[var(--text-secondary)]">{matchExplanation}</p>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[var(--text-muted)]">{t.mood.matchStrength}</span>
            <span className="text-[10px] font-medium text-[var(--text-primary)]">{strengthPercent}%</span>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-[var(--bg-accent)]"
            role="progressbar"
            aria-valuenow={strengthPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${t.mood.matchStrength}: ${strengthPercent}%`}
          >
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{ width: `${strengthPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
