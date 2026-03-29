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
        <h1 className="mb-6 text-xl font-bold text-stone-800">Matches</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-4 text-lg font-medium text-stone-800">No matches yet</p>
          <p className="mt-1 text-sm text-slate-500">Keep discovering to find your film matches!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-xl font-bold text-stone-800">Matches</h1>
      <div className="space-y-3">
        {matches.map((match) => (
          <Link
            key={match.matchId}
            href={`/matches/${match.matchId}`}
            className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-white p-4 transition-colors hover:bg-emerald-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-stone-800">
              {match.otherUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800 truncate">{match.otherUser.name}</p>
              <p className="text-sm text-slate-500">
                {match.sharedFilmCount} shared films · {Math.round(match.score * 100)}% match
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {new Date(match.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
