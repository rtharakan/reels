'use client';

import Image from 'next/image';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';

interface MoodTwin {
  userId: string;
  displayName: string | null;
  image: string | null;
  sharedFilmCount: number;
  mood: string;
}

interface MoodTwinsSectionProps {
  twins: MoodTwin[];
}

export function MoodTwinsSection({ twins }: MoodTwinsSectionProps) {
  const { t } = useI18n();
  const connectMutation = trpc.mood.expressInterest.useMutation();

  const handleConnect = (targetUserId: string) => {
    connectMutation.mutate({ targetUserId });
  };

  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">{t.mood.moodTwins}</h2>
      {twins.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)] py-6 text-center">{t.mood.moodTwinsEmpty}</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {twins.map((twin) => (
            <div
              key={twin.userId}
              className="flex flex-col items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4"
            >
              {twin.image ? (
                <Image
                  src={twin.image}
                  alt={twin.displayName ?? ''}
                  width={48}
                  height={48}
                  className="rounded-full object-cover mb-2"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-lg mb-2">
                  {(twin.displayName ?? '?')[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-[var(--text-primary)] text-center truncate max-w-full">
                {twin.displayName ?? 'User'}
              </span>
              {twin.sharedFilmCount > 0 && (
                <span className="text-[10px] text-[var(--text-muted)]">
                  {twin.sharedFilmCount} {t.mood.filmsInCommon}
                </span>
              )}
              <button
                type="button"
                onClick={() => handleConnect(twin.userId)}
                disabled={connectMutation.isPending}
                className="mt-2 rounded-lg border border-[var(--accent)] px-3 py-1 text-[11px] font-medium text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors disabled:opacity-50"
              >
                {t.mood.connect}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
