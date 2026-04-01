'use client';

import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';

const MOOD_COLORS: Record<string, string> = {
  NOSTALGIC: 'bg-amber-400',
  ADVENTUROUS: 'bg-green-400',
  HEARTBROKEN: 'bg-rose-400',
  HYPE: 'bg-orange-400',
  CHILL: 'bg-blue-400',
  ROMANTIC: 'bg-pink-400',
  MYSTERIOUS: 'bg-purple-400',
  INSPIRED: 'bg-yellow-400',
  MELANCHOLIC: 'bg-slate-400',
  COZY: 'bg-orange-300',
};

export function MoodHistory() {
  const { t } = useI18n();
  const { data, isLoading } = trpc.mood.getHistory.useQuery();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-[var(--bg-accent)] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data?.history.length) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-6">{t.mood.noActiveMood}</p>
    );
  }

  const moodNameKey = (mood: string) => mood.toLowerCase() as keyof typeof t.mood;

  return (
    <div className="space-y-2">
      {data.history.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-3"
        >
          <div className={`h-3 w-3 rounded-full ${MOOD_COLORS[entry.mood] ?? 'bg-gray-400'}`} />
          <div className="flex-1">
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {(t.mood as Record<string, string>)[moodNameKey(entry.mood)] ?? entry.mood}
            </span>
            <span className="ml-2 text-xs text-[var(--text-muted)]">
              {new Date(entry.selectedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          {entry.isActive && (
            <span className="rounded-full bg-green-100 dark:bg-green-900/40 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300">
              {t.mood.currentlyActive}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
