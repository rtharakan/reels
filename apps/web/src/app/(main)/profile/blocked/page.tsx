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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <Link href="/profile" className="mb-4 inline-flex items-center text-sm text-zinc-400 hover:text-white">
        ← Back to profile
      </Link>
      <h1 className="mb-6 text-xl font-bold text-white">Blocked Users</h1>

      {!blockedUsers || blockedUsers.length === 0 ? (
        <p className="text-sm text-zinc-400">No blocked users.</p>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((user) => (
            <div key={user.userId} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div>
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-xs text-zinc-500">Blocked {new Date(user.blockedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => unblockMutation.mutate({ userId: user.userId })}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
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
