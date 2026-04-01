'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { MoodHistory } from '@/components/mood/mood-history';

export default function MoodHistoryPage() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/mood')}
          className="rounded-lg p-2 hover:bg-[var(--bg-accent)] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">{t.mood.moodHistory}</h1>
      </div>

      <MoodHistory />

      <div className="mt-6 text-center">
        <a href="/mood" className="text-sm text-[var(--accent)] hover:underline">
          {t.mood.updateMood}
        </a>
      </div>
    </div>
  );
}
