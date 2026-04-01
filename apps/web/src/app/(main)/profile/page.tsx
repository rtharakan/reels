'use client';

import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { DeleteAccountDialog } from '@/components/delete-account-dialog';
import { TmdbAttribution } from '@/components/tmdb-attribution';

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = trpc.user.me.useQuery();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteMutation = trpc.user.deleteAccount.useMutation({
    onSuccess: () => {
      router.push('/');
    },
  });

  const reimportMutation = trpc.watchlist.import.useMutation({
    onSuccess: () => {
      window.location.reload();
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="skeleton h-6 w-16 mb-6" />
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
          <div className="skeleton h-16 w-16 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">Profile</h1>

      <div className="space-y-4">
        {/* Profile header */}
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-soft">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-soft)] text-2xl font-semibold text-[var(--accent)]">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{user.name}, {user.age}</h2>
            <p className="text-sm text-[var(--text-muted)]">{user.location}</p>
            <p className="text-xs text-[var(--text-muted)]">{user.watchlistCount} films imported</p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-soft">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{user.bio}</p>
          </div>
        )}

        {/* Prompts */}
        {user.prompts.length > 0 && (
          <div className="space-y-2">
            {user.prompts.map((p: { question: string; answer: string }, i: number) => (
              <div key={i} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-soft">
                <p className="text-xs text-[var(--text-muted)] mb-0.5">{p.question}</p>
                <p className="text-sm text-[var(--text-primary)]">{p.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Top films */}
        {user.topFilms.length > 0 && (
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-soft">
            <h3 className="mb-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Top Films</h3>
            <div className="flex gap-2">
              {user.topFilms.map((film: { id: string; title: string; posterUrl?: string | null }) => (
                <div key={film.id} className="flex-shrink-0">
                  {film.posterUrl ? (
                    <div className="aspect-[2/3] w-[60px] overflow-hidden rounded-xl">
                      <Image src={film.posterUrl} alt={`${film.title} poster`} width={60} height={90} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-[90px] w-[60px] items-center justify-center rounded-xl bg-[var(--bg-accent)] text-[10px] text-[var(--text-muted)] p-1 text-center">
                      {film.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Link href="/profile/edit" className="block w-full rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors">
            Edit Profile
          </Link>

          {user.letterboxdUsername && (
            <button
              onClick={() => reimportMutation.mutate({ letterboxdUsername: user.letterboxdUsername! })}
              disabled={reimportMutation.isPending}
              className="w-full rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] disabled:opacity-50 transition-colors"
            >
              {reimportMutation.isPending ? 'Re-importing...' : 'Re-import Watchlist'}
            </button>
          )}

          <Link href="/profile/blocked" className="block w-full rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-center text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors">
            Blocked Users
          </Link>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full rounded-xl border border-red-200 dark:border-red-900 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            Delete Account
          </button>
        </div>

        {/* TMDB Attribution */}
        <TmdbAttribution className="pt-2" />
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <DeleteAccountDialog
          onConfirm={() => {
            deleteMutation.mutate();
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
