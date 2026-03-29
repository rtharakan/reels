'use client';

import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

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
      // Refetch user data
      window.location.reload();
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Profile</h1>

      <div className="space-y-4">
        {/* Profile header */}
        <div className="flex items-center gap-4 rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-2xl font-bold text-[var(--text-primary)]">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{user.name}, {user.age}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{user.location}</p>
            <p className="text-sm text-[var(--text-muted)]">{user.watchlistCount} films imported</p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <p className="text-sm text-[var(--text-secondary)]">{user.bio}</p>
          </div>
        )}

        {/* Prompts */}
        {user.prompts.length > 0 && (
          <div className="space-y-2">
            {user.prompts.map((p, i) => (
              <div key={i} className="rounded-lg bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 p-3">
                <p className="text-xs text-[var(--text-muted)]">{p.question}</p>
                <p className="text-sm text-[var(--text-secondary)]">{p.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Top films */}
        {user.topFilms.length > 0 && (
          <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
            <h3 className="mb-3 font-medium text-[var(--text-primary)]">Top Films</h3>
            <div className="flex gap-2">
              {user.topFilms.map((film) => (
                <div key={film.id} className="flex-shrink-0">
                  {film.posterUrl ? (
                    <div className="aspect-[2/3] w-[60px] overflow-hidden rounded-lg">
                      <Image src={film.posterUrl} alt={`${film.title} poster`} width={60} height={90} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-[90px] w-[60px] items-center justify-center rounded-lg bg-blue-50 dark:bg-slate-700 text-xs text-[var(--text-muted)] p-1 text-center">
                      {film.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Link href="/profile/edit" className="block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-[var(--text-secondary)] hover:bg-blue-50 dark:bg-slate-700">
            Edit Profile
          </Link>

          {user.letterboxdUsername && (
            <button
              onClick={() => reimportMutation.mutate({ letterboxdUsername: user.letterboxdUsername! })}
              disabled={reimportMutation.isPending}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-blue-50 dark:bg-slate-700 disabled:opacity-50"
            >
              {reimportMutation.isPending ? 'Re-importing...' : 'Re-import Watchlist'}
            </button>
          )}

          <Link href="/profile/blocked" className="block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-[var(--text-secondary)] hover:bg-blue-50 dark:bg-slate-700">
            Blocked Users
          </Link>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full rounded-lg border border-red-900 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/20"
          >
            Delete Account
          </button>
        </div>

        {/* TMDB Attribution */}
        <p className="text-center text-xs text-[var(--text-muted)]">
          Film data powered by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)]">
            TMDB
          </a>
        </p>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="w-full max-w-sm rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h2 id="delete-title" className="text-lg font-bold text-[var(--text-primary)]">Delete your account?</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              This will permanently delete your profile, watchlist, matches, and all associated data.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-blue-50 dark:bg-slate-700">
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
