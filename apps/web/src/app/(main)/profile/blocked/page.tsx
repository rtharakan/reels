'use client';

import { trpc } from '@/lib/trpc';
import Link from 'next/link';

export default function BlockedUsersPage() {
  const { data: blockedUsers, isLoading, refetch } = trpc.safety.getBlockedUsers.useQuery();
  const unblockMutation = trpc.safety.unblock.useMutation({
    onSuccess: () => refetch(),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <Link href="/profile" className="mb-4 inline-flex items-center text-sm text-slate-500 hover:text-stone-800">
        ← Back to profile
      </Link>
      <h1 className="mb-6 text-xl font-bold text-stone-800">Blocked Users</h1>

      {!blockedUsers || blockedUsers.length === 0 ? (
        <p className="text-sm text-slate-500">No blocked users.</p>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((user) => (
            <div key={user.userId} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white p-4">
              <div>
                <p className="font-medium text-stone-800">{user.name}</p>
                <p className="text-xs text-slate-400">Blocked {new Date(user.blockedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => unblockMutation.mutate({ userId: user.userId })}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-stone-500 hover:bg-emerald-50"
              >
                Unblock
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
