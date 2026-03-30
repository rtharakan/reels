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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <Link href="/profile" className="mb-4 inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        ← Back to profile
      </Link>
      <h1 className="mb-6 text-xl font-bold text-[var(--text-primary)]">Blocked Users</h1>

      {!blockedUsers || blockedUsers.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">No blocked users.</p>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((user) => (
            <div key={user.userId} className="flex items-center justify-between rounded-lg border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div>
                <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">Blocked {new Date(user.blockedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => unblockMutation.mutate({ userId: user.userId })}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-blue-50 dark:bg-slate-700"
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
