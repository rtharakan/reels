'use client';

import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Film } from 'lucide-react';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { data: match, isLoading } = trpc.match.getById.useQuery({ matchId });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--text-secondary)]">
        Match not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <Link href="/matches" className="mb-4 inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        ← Back to matches
      </Link>

      <div className="space-y-6">
        {/* Profile header */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-3xl font-bold text-[var(--text-primary)]">
            {match.otherUser.name.charAt(0)}
          </div>
          <h1 className="mt-3 text-xl font-bold text-[var(--text-primary)]">{match.otherUser.name}, {match.otherUser.age}</h1>
          <p className="text-sm text-[var(--text-secondary)]">{match.otherUser.location}</p>
          <p className="mt-2 text-lg font-semibold text-[var(--text-secondary)]">{Math.round(match.score * 100)}% match</p>
        </div>

        {/* Why you matched */}
        <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <h2 className="mb-3 font-semibold text-[var(--text-primary)]">Why you matched</h2>

          <p className="text-sm text-[var(--text-secondary)] mb-3">
            You share <strong className="text-[var(--text-primary)]">{match.sharedFilms.length} films</strong> in your watchlists.
          </p>

          {/* Genre overlap */}
          {match.genreOverlap.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-[var(--text-muted)] mb-2">Top shared genres</p>
              <div className="flex flex-wrap gap-2">
                {match.genreOverlap.slice(0, 5).map((g) => (
                  <span key={g.genreName} className="rounded-full bg-blue-50 dark:bg-slate-700 px-2.5 py-0.5 text-xs text-[var(--text-secondary)]">
                    {g.genreName} ({g.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared films grid */}
          {match.sharedFilms.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-2">Films you both love</p>
              <div className="grid grid-cols-4 gap-2">
                {match.sharedFilms.slice(0, 8).map((film) => (
                  <div key={film.id}>
                    <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
                      {film.posterUrl ? (
                        <Image src={film.posterUrl} alt={`${film.title} poster`} width={80} height={120} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center p-1 text-center">
                          <Film className="h-5 w-5 text-slate-400 dark:text-slate-500 mb-1" />
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-3">{film.title}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bio & prompts */}
        {match.otherUser.bio && (
          <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h2 className="mb-2 font-semibold text-[var(--text-primary)]">About</h2>
            <p className="text-sm text-[var(--text-secondary)]">{match.otherUser.bio}</p>
          </div>
        )}

        {match.otherUser.prompts.length > 0 && (
          <div className="space-y-2">
            {match.otherUser.prompts.map((p, i) => (
              <div key={i} className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
                <p className="text-xs text-[var(--text-muted)]">{p.question}</p>
                <p className="text-sm text-[var(--text-secondary)]">{p.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
