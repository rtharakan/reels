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
      <div className="mx-auto max-w-lg px-4 pt-6">
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <Link href="/profile" className="mb-4 inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
        ← Back to profile
      </Link>
      <h1 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">Blocked Users</h1>

      {!blockedUsers || blockedUsers.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No blocked users.</p>
      ) : (
        <div className="space-y-3">
          {blockedUsers.map((user) => (
            <div key={user.userId} className="flex items-center justify-between rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-soft">
              <div>
                <p className="font-medium text-[var(--text-primary)]">{user.name}</p>
                <p className="text-xs text-[var(--text-muted)]">Blocked {new Date(user.blockedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => unblockMutation.mutate({ userId: user.userId })}
                className="rounded-xl border border-[var(--border-default)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors"
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
