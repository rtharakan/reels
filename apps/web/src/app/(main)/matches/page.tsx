'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';

export default function MatchesPage() {
  const { data: matches, isLoading } = trpc.match.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <h1 className="mb-6 text-xl font-bold text-white">Matches</h1>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl">🎬</p>
          <p className="mt-4 text-lg font-medium text-white">No matches yet</p>
          <p className="mt-1 text-sm text-zinc-400">Keep discovering to find your film matches!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-xl font-bold text-white">Matches</h1>
      <div className="space-y-3">
        {matches.map((match) => (
          <Link
            key={match.matchId}
            href={`/matches/${match.matchId}`}
            className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:bg-zinc-800"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700 text-lg font-bold text-white">
              {match.otherUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">{match.otherUser.name}</p>
              <p className="text-sm text-zinc-400">
                {match.sharedFilmCount} shared films · {Math.round(match.score * 100)}% match
              </p>
            </div>
            <span className="text-xs text-zinc-500">
              {new Date(match.createdAt).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
