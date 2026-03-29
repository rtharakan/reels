'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';

export default function MatchesPage() {
  const { data: matches, isLoading } = trpc.match.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Matches</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-4 text-lg font-medium text-[var(--text-primary)]">No matches yet</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Keep discovering to find your film matches!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Matches</h1>
      <div className="space-y-3">
        {matches.map((match) => (
          <Link
            key={match.matchId}
            href={`/matches/${match.matchId}`}
            className="flex items-center gap-4 rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 transition-colors hover:bg-blue-50 dark:bg-slate-700"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-lg font-bold text-[var(--text-primary)]">
              {match.otherUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[var(--text-primary)] truncate">{match.otherUser.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {match.sharedFilmCount} shared films · {Math.round(match.score * 100)}% match
              </p>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {new Date(match.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
