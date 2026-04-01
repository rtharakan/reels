'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Ticket, ArrowLeft, Share2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { VotingGrid } from '@/components/picker/voting-grid';
import { PlanSummaryCard } from '@/components/picker/plan-summary-card';
import { GuestJoinForm } from '@/components/picker/guest-join-form';
import Image from 'next/image';

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : undefined;
}

export default function PlanDetailPage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  const [guestToken, setGuestToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    setGuestToken(getCookie('reels-picker-guest'));
  }, []);

  const { data: plan, isLoading, error, refetch } = trpc.picker.get.useQuery(
    { planId },
    { enabled: !!planId }
  );

  const confirmMutation = trpc.picker.confirm.useMutation({
    onSuccess: () => refetch(),
  });

  const [confirmingShowtimeId, setConfirmingShowtimeId] = useState<string | null>(null);

  const handleConfirm = async (showtimeId: string) => {
    setConfirmingShowtimeId(showtimeId);
    try {
      await confirmMutation.mutateAsync({ planId, showtimeId });
    } finally {
      setConfirmingShowtimeId(null);
    }
  };

  const handleJoined = (sessionToken: string | null) => {
    if (sessionToken) {
      document.cookie = `reels-picker-guest=${encodeURIComponent(sessionToken)}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      setGuestToken(sessionToken);
    }
    refetch();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-[var(--bg-accent)] rounded" />
          <div className="h-4 w-32 bg-[var(--bg-accent)] rounded" />
          <div className="h-64 bg-[var(--bg-accent)] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t.picker.planNotFound}</h1>
        <button
          type="button"
          onClick={() => router.push('/picker')}
          className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t.picker.createNewPlan}
        </button>
      </div>
    );
  }

  const isExpired = plan.status === 'EXPIRED' || plan.status === 'ARCHIVED';
  const isConfirmed = plan.status === 'CONFIRMED';
  const isVoting = plan.status === 'VOTING';
  const isParticipant = !!plan.currentParticipantId;
  const isOrganizer = plan.participants.some(
    (p) => p.isOrganizer && p.id === plan.currentParticipantId
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/picker')}
          className="rounded-lg p-2 hover:bg-[var(--bg-accent)] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{plan.filmTitle}</h1>
          </div>
          {plan.filmYear && <p className="text-xs text-[var(--text-muted)]">{plan.filmYear}</p>}
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className="rounded-lg p-2 hover:bg-[var(--bg-accent)] transition-colors"
          aria-label="Share"
        >
          <Share2 className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Expired/Archived State */}
      {isExpired && (
        <div className="text-center py-12">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 p-8">
            <p className="text-lg font-medium text-[var(--text-primary)] mb-2">{t.picker.expired}</p>
            <p className="text-sm text-[var(--text-muted)] mb-4">{t.picker.expiredDesc}</p>
            <button
              type="button"
              onClick={() => router.push('/picker')}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              {t.picker.createNewPlan}
            </button>
          </div>
        </div>
      )}

      {/* Confirmed State */}
      {isConfirmed && plan.confirmedShowtime && (
        <PlanSummaryCard
          filmTitle={plan.filmTitle}
          filmYear={plan.filmYear}
          filmPosterPath={plan.filmPosterPath}
          cinemaName={plan.confirmedShowtime.cinemaName}
          cinemaCity={plan.confirmedShowtime.cinemaCity}
          date={plan.confirmedShowtime.date}
          time={plan.confirmedShowtime.time}
          ticketUrl={plan.confirmedShowtime.ticketUrl}
          participants={plan.participants}
          shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
        />
      )}

      {/* Voting State */}
      {isVoting && (
        <div className="space-y-6">
          {/* Film info header */}
          <div className="flex gap-4 items-start">
            {plan.filmPosterPath && (
              <Image
                src={`https://image.tmdb.org/t/p/w154${plan.filmPosterPath}`}
                alt={plan.filmTitle}
                width={80}
                height={120}
                className="rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                {t.picker.organizedBy} {plan.organizer.name}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {t.picker.participants}: {plan.participants.length} · {t.picker.expiresOn} {new Date(plan.expiresAt).toLocaleDateString()}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {plan.participants.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center rounded-full bg-[var(--bg-accent)] px-2 py-0.5 text-xs text-[var(--text-secondary)]"
                  >
                    {p.displayName}
                    {p.isOrganizer && <span className="ml-1 text-[var(--accent)]">★</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Guest join form - show if not a participant */}
          {!isParticipant && (
            <GuestJoinForm
              planId={planId}
              guestSessionToken={guestToken}
              onJoined={handleJoined}
            />
          )}

          {/* Voting grid */}
          {isParticipant && (
            <>
              <VotingGrid
                showtimes={plan.showtimes}
                participants={plan.participants}
                currentParticipantId={plan.currentParticipantId}
                planStatus={plan.status}
              />

              {/* Organizer confirm button */}
              {isOrganizer && (
                <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
                  <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">
                    {t.picker.confirmShowtime}
                  </h3>
                  <div className="space-y-2">
                    {plan.showtimes.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-lg border border-[var(--border-default)] p-3">
                        <div>
                          <span className="text-sm font-medium text-[var(--text-primary)]">{s.cinemaName}</span>
                          <span className="ml-2 text-xs text-[var(--text-muted)]">{s.date} · {s.time}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-green-600">✓ {s.voteCount.available}</span>
                          <button
                            type="button"
                            onClick={() => handleConfirm(s.id)}
                            disabled={confirmMutation.isPending}
                            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                          >
                            {confirmingShowtimeId === s.id ? '...' : t.picker.confirm}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
