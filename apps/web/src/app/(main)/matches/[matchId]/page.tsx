'use client';

import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { data: match, isLoading } = trpc.match.getById.useQuery({ matchId });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Match not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <Link href="/matches" className="mb-4 inline-flex items-center text-sm text-slate-500 hover:text-stone-800">
        ← Back to matches
      </Link>

      <div className="space-y-6">
        {/* Profile header */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-3xl font-bold text-stone-800">
            {match.otherUser.name.charAt(0)}
          </div>
          <h1 className="mt-3 text-xl font-bold text-stone-800">{match.otherUser.name}, {match.otherUser.age}</h1>
          <p className="text-sm text-slate-500">{match.otherUser.location}</p>
          <p className="mt-2 text-lg font-semibold text-stone-600">{Math.round(match.score * 100)}% match</p>
        </div>

        {/* Why you matched */}
        <div className="rounded-xl border border-emerald-100 bg-white p-4">
          <h2 className="mb-3 font-semibold text-stone-800">Why you matched</h2>

          <p className="text-sm text-stone-500 mb-3">
            You share <strong className="text-stone-800">{match.sharedFilms.length} films</strong> in your watchlists.
          </p>

          {/* Genre overlap */}
          {match.genreOverlap.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-slate-400 mb-2">Top shared genres</p>
              <div className="flex flex-wrap gap-2">
                {match.genreOverlap.slice(0, 5).map((g) => (
                  <span key={g.genreName} className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-stone-500">
                    {g.genreName} ({g.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared films grid */}
          {match.sharedFilms.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">Films you both love</p>
              <div className="grid grid-cols-4 gap-2">
                {match.sharedFilms.slice(0, 8).map((film) => (
                  <div key={film.id}>
                    {film.posterUrl ? (
                      <div className="aspect-[2/3] overflow-hidden rounded-lg">
                        <Image src={film.posterUrl} alt={`${film.title} poster`} width={80} height={120} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center rounded-lg bg-emerald-50 p-1 text-xs text-slate-400 text-center">
                        {film.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bio & prompts */}
        {match.otherUser.bio && (
          <div className="rounded-xl border border-emerald-100 bg-white p-4">
            <h2 className="mb-2 font-semibold text-stone-800">About</h2>
            <p className="text-sm text-stone-500">{match.otherUser.bio}</p>
          </div>
        )}

        {match.otherUser.prompts.length > 0 && (
          <div className="space-y-2">
            {match.otherUser.prompts.map((p, i) => (
              <div key={i} className="rounded-xl border border-emerald-100 bg-white p-4">
                <p className="text-xs text-slate-400">{p.question}</p>
                <p className="text-sm text-stone-600">{p.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
