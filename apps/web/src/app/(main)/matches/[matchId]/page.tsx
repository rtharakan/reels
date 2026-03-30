'use client';

import { trpc } from '@/lib/trpc';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Film, ArrowLeft, Info } from 'lucide-react';

function getMatchLabel(score: number): { text: string; emoji: string } {
  if (score >= 0.5) return { text: 'Soul Mates', emoji: '💕' };
  if (score >= 0.3) return { text: 'Great Match', emoji: '🎬' };
  if (score >= 0.15) return { text: 'Good Vibes', emoji: '✨' };
  return { text: 'Film Friends', emoji: '🎞️' };
}

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const { data: match, isLoading } = trpc.match.getById.useQuery({ matchId });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="skeleton h-4 w-32 mb-6" />
        <div className="space-y-4">
          <div className="flex flex-col items-center">
            <div className="skeleton h-20 w-20 rounded-full" />
            <div className="skeleton h-5 w-32 mt-3" />
            <div className="skeleton h-4 w-20 mt-2" />
          </div>
          <div className="skeleton h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center text-[var(--text-muted)]">
        Match not found
      </div>
    );
  }

  const label = getMatchLabel(match.score);

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <Link href="/matches" className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Matches
      </Link>

      <div className="space-y-5">
        {/* Profile header */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-soft)] text-3xl font-semibold text-[var(--accent)]">
            {match.otherUser.name.charAt(0)}
          </div>
          <h1 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">{match.otherUser.name}, {match.otherUser.age}</h1>
          <p className="text-sm text-[var(--text-muted)]">{match.otherUser.location}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1.5">
            <span>{label.emoji}</span>
            <span className="text-sm font-medium text-[var(--accent)]">{Math.round(match.score * 100)}% — {label.text}</span>
          </div>
        </div>

        {/* Why you matched — with explanation */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-soft">
          <h2 className="mb-3 font-semibold text-[var(--text-primary)]">Why you matched</h2>

          <div className="flex items-start gap-2 rounded-xl bg-[var(--bg-accent)] p-3 mb-4">
            <Info className="h-3.5 w-3.5 text-[var(--accent)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your {Math.round(match.score * 100)}% score is based on 5 signals: liked films (30%), high ratings (25%), genre taste (20%), watched films (15%), and watchlist overlap (10%). You share <strong className="text-[var(--text-primary)]">{match.sharedFilms.length} films</strong> in your watchlists.
            </p>
          </div>

          {/* Genre overlap */}
          {match.genreOverlap.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Shared genres</p>
              <div className="flex flex-wrap gap-1.5">
                {match.genreOverlap.slice(0, 5).map((g: { genreName: string; count: number }) => (
                  <span key={g.genreName} className="rounded-full bg-[var(--bg-accent)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">
                    {g.genreName} ({g.count})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Shared films grid */}
          {match.sharedFilms.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Films you both love</p>
              <div className="grid grid-cols-4 gap-2">
                {match.sharedFilms.slice(0, 8).map((film: { id: string; title: string; posterUrl?: string | null }, idx: number) => (
                  <div key={film.id}>
                    {film.posterUrl ? (
                      <div className="aspect-[2/3] overflow-hidden rounded-xl">
                        <Image src={film.posterUrl} alt={`${film.title} poster`} width={80} height={120} className="h-full w-full object-cover" loading={idx < 2 ? undefined : "lazy"} />
                      </div>
                    ) : (
                      <div className="flex aspect-[2/3] items-center justify-center rounded-xl bg-[var(--bg-accent)] p-1 text-[10px] text-[var(--text-muted)] text-center">
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
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-soft">
            <h2 className="mb-2 text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">About</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{match.otherUser.bio}</p>
          </div>
        )}

        {match.otherUser.prompts.length > 0 && (
          <div className="space-y-2">
            {match.otherUser.prompts.map((p: { question: string; answer: string }, i: number) => (
              <div key={i} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-soft">
                <p className="text-xs text-[var(--text-muted)] mb-1">{p.question}</p>
                <p className="text-sm text-[var(--text-primary)]">{p.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
