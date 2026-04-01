'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';

interface GuestJoinFormProps {
  planId: string;
  guestSessionToken?: string;
  onJoined: (sessionToken: string | null) => void;
}

export function GuestJoinForm({ planId, guestSessionToken, onJoined }: GuestJoinFormProps) {
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState('');
  const joinMutation = trpc.picker.join.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = displayName.trim();
    if (!name) return;

    const result = await joinMutation.mutateAsync({
      planId,
      displayName: name,
      guestSessionToken,
    });
    onJoined(result.sessionToken);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6">
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">{t.picker.joinPlan}</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value.slice(0, 50))}
          placeholder={t.picker.displayName}
          pattern="^[a-zA-Z0-9\s\-_.]+$"
          maxLength={50}
          required
          className="flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
        />
        <button
          type="submit"
          disabled={joinMutation.isPending || !displayName.trim()}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {joinMutation.isPending ? '...' : t.picker.join}
        </button>
      </div>
      {joinMutation.isError && (
        <p className="mt-2 text-xs text-red-500">{t.picker.joinError}</p>
      )}
    </form>
  );
}
