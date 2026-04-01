'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';

type VoteStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE';

interface Showtime {
  id: string;
  cinemaName: string;
  cinemaCity: string;
  date: string;
  time: string;
  voteCount: { available: number; unavailable: number; maybe: number };
}

interface Participant {
  id: string;
  displayName: string;
  isOrganizer: boolean;
}

interface VotingGridProps {
  showtimes: Showtime[];
  participants: Participant[];
  currentParticipantId: string | null;
  planStatus: string;
}

const STATUS_ICONS: Record<VoteStatus, { icon: string; color: string; label: string }> = {
  AVAILABLE: { icon: '✓', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', label: 'Available' },
  UNAVAILABLE: { icon: '✗', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', label: 'Unavailable' },
  MAYBE: { icon: '?', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300', label: 'Maybe' },
};

const CYCLE: VoteStatus[] = ['AVAILABLE', 'UNAVAILABLE', 'MAYBE'];

export function VotingGrid({ showtimes, participants: _participants, currentParticipantId, planStatus }: VotingGridProps) {
  const { t } = useI18n();
  const [votes, setVotes] = useState<Record<string, VoteStatus>>({});
  const voteMutation = trpc.picker.vote.useMutation();

  const disabled = planStatus !== 'VOTING' || !currentParticipantId;

  const handleToggle = async (showtimeId: string) => {
    if (disabled) return;
    const currentStatus = votes[showtimeId];
    const nextIdx = currentStatus ? (CYCLE.indexOf(currentStatus) + 1) % CYCLE.length : 0;
    const nextStatus = CYCLE[nextIdx]!;
    setVotes((prev) => ({ ...prev, [showtimeId]: nextStatus }));

    try {
      await voteMutation.mutateAsync({
        participantId: currentParticipantId!,
        votes: [{ showtimeId, status: nextStatus }],
      });
    } catch {
      // Revert on error
      setVotes((prev) => {
        const next = { ...prev };
        if (currentStatus) next[showtimeId] = currentStatus;
        else delete next[showtimeId];
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-[var(--text-primary)]">{t.picker.voteTally}</h3>

      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {showtimes.map((s) => {
          const voteStatus = votes[s.id];
          const statusInfo = voteStatus ? STATUS_ICONS[voteStatus] : null;
          return (
            <div key={s.id} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{s.cinemaName}</div>
                  <div className="text-xs text-[var(--text-muted)]">{s.date} · {s.time}</div>
                </div>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleToggle(s.id)}
                    className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg font-bold transition-colors ${
                      statusInfo ? statusInfo.color : 'bg-[var(--bg-accent)] text-[var(--text-muted)]'
                    }`}
                    aria-label={statusInfo?.label ?? 'Vote'}
                  >
                    {statusInfo?.icon ?? '·'}
                  </button>
                )}
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-green-600">✓ {s.voteCount.available}</span>
                <span className="text-red-600">✗ {s.voteCount.unavailable}</span>
                <span className="text-amber-600">? {s.voteCount.maybe}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop grid view */}
      <div className="hidden md:block overflow-x-auto" role="grid" aria-label="Voting grid">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-[var(--text-muted)] py-2 px-3">Showtime</th>
              <th className="text-center text-xs font-medium text-[var(--text-muted)] py-2 px-2">✓</th>
              <th className="text-center text-xs font-medium text-[var(--text-muted)] py-2 px-2">✗</th>
              <th className="text-center text-xs font-medium text-[var(--text-muted)] py-2 px-2">?</th>
              {!disabled && <th className="text-center text-xs font-medium text-[var(--text-muted)] py-2 px-2">Your vote</th>}
            </tr>
          </thead>
          <tbody>
            {showtimes.map((s) => {
              const voteStatus = votes[s.id];
              const statusInfo = voteStatus ? STATUS_ICONS[voteStatus] : null;
              return (
                <tr key={s.id} className="border-t border-[var(--border-default)]">
                  <td className="py-3 px-3">
                    <div className="text-sm font-medium text-[var(--text-primary)]">{s.cinemaName}</div>
                    <div className="text-xs text-[var(--text-muted)]">{s.date} · {s.time}</div>
                  </td>
                  <td className="text-center text-sm text-green-600">{s.voteCount.available}</td>
                  <td className="text-center text-sm text-red-600">{s.voteCount.unavailable}</td>
                  <td className="text-center text-sm text-amber-600">{s.voteCount.maybe}</td>
                  {!disabled && (
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(s.id)}
                        className={`h-8 w-8 rounded-lg inline-flex items-center justify-center text-sm font-bold transition-colors ${
                          statusInfo ? statusInfo.color : 'bg-[var(--bg-accent)] text-[var(--text-muted)] hover:bg-[var(--bg-accent)]/80'
                        }`}
                        aria-label={`Vote for ${s.cinemaName} ${s.date} ${s.time}: ${statusInfo?.label ?? 'Not voted'}`}
                      >
                        {statusInfo?.icon ?? '·'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
