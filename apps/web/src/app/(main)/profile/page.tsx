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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-xl font-bold text-white">Profile</h1>

      <div className="space-y-4">
        {/* Profile header */}
        <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-700 text-2xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user.name}, {user.age}</h2>
            <p className="text-sm text-zinc-400">{user.location}</p>
            <p className="text-sm text-zinc-500">{user.watchlistCount} films imported</p>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-sm text-zinc-300">{user.bio}</p>
          </div>
        )}

        {/* Prompts */}
        {user.prompts.length > 0 && (
          <div className="space-y-2">
            {user.prompts.map((p, i) => (
              <div key={i} className="rounded-lg bg-zinc-900 border border-zinc-800 p-3">
                <p className="text-xs text-zinc-500">{p.question}</p>
                <p className="text-sm text-zinc-200">{p.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Top films */}
        {user.topFilms.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="mb-3 font-medium text-white">Top Films</h3>
            <div className="flex gap-2">
              {user.topFilms.map((film) => (
                <div key={film.id} className="flex-shrink-0">
                  {film.posterUrl ? (
                    <div className="aspect-[2/3] w-[60px] overflow-hidden rounded-lg">
                      <Image src={film.posterUrl} alt={`${film.title} poster`} width={60} height={90} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-[90px] w-[60px] items-center justify-center rounded-lg bg-zinc-800 text-xs text-zinc-500 p-1 text-center">
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
          <Link href="/profile/edit" className="block w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-800">
            Edit Profile
          </Link>

          {user.letterboxdUsername && (
            <button
              onClick={() => reimportMutation.mutate({ letterboxdUsername: user.letterboxdUsername! })}
              disabled={reimportMutation.isPending}
              className="w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
            >
              {reimportMutation.isPending ? 'Re-importing...' : 'Re-import Watchlist'}
            </button>
          )}

          <Link href="/profile/blocked" className="block w-full rounded-lg border border-zinc-700 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-800">
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
        <p className="text-center text-xs text-zinc-600">
          Film data powered by{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-400">
            TMDB
          </a>
        </p>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 id="delete-title" className="text-lg font-bold text-white">Delete your account?</h2>
            <p className="mt-2 text-sm text-zinc-400">
              This will permanently delete your profile, watchlist, matches, and all associated data.
              This action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800">
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
