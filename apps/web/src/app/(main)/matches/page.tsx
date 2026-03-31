'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';

export default function MatchesPage() {
  const { data: matches, isLoading } = trpc.match.list.useQuery();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="skeleton h-6 w-20 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
              <div className="skeleton h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h1 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">Matches</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-4 text-base font-medium text-[var(--text-primary)]">No matches yet</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Keep exploring — your fellow cinephile is out there.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">Matches</h1>
      <div className="space-y-3">
        {matches.map((match) => (
          <Link
            key={match.matchId}
            href={`/matches/${match.matchId}`}
            className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 transition-all hover:shadow-soft-md hover:border-[var(--accent)]/30 active:scale-[0.99]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-lg font-semibold text-[var(--accent)]">
              {match.otherUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text-primary)] truncate">{match.otherUser.name}</p>
              <p className="text-sm text-[var(--text-muted)]">
                {match.sharedFilmCount} films · {Math.round(match.score * 100)}%
              </p>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {new Date(match.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
