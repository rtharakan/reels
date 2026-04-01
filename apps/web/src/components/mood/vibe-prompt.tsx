'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';

export function VibePrompt() {
  const { t } = useI18n();
  const { data } = trpc.mood.getSuggestions.useQuery(undefined, {
    retry: false,
  });

  // If user already has an active mood with suggestions, don't show prompt
  if (data && data.suggestions && data.suggestions.length > 0) {
    return null;
  }

  return (
    <Link
      href="/mood"
      className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 transition-colors hover:border-amber-300 dark:hover:border-amber-700"
    >
      <Sparkles className="h-8 w-8 text-amber-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">{t.mood.vibePrompt}</p>
        <p className="text-xs text-[var(--text-muted)]">{t.mood.setYourMood}</p>
      </div>
    </Link>
  );
}
