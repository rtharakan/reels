'use client';

import { useI18n } from '@/lib/i18n';

type MoodType =
  | 'NOSTALGIC' | 'ADVENTUROUS' | 'HEARTBROKEN' | 'HYPE' | 'CHILL'
  | 'ROMANTIC' | 'MYSTERIOUS' | 'INSPIRED' | 'MELANCHOLIC' | 'COZY';

interface MoodOption {
  mood: MoodType;
  emoji: string;
  nameKey: keyof ReturnType<typeof useI18n>['t']['mood'];
  descKey: keyof ReturnType<typeof useI18n>['t']['mood'];
  color: string;
}

const MOODS: MoodOption[] = [
  { mood: 'NOSTALGIC', emoji: '📼', nameKey: 'nostalgic', descKey: 'nostalgicDesc', color: 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700' },
  { mood: 'ADVENTUROUS', emoji: '🏔️', nameKey: 'adventurous', descKey: 'adventurousDesc', color: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700' },
  { mood: 'HEARTBROKEN', emoji: '💔', nameKey: 'heartbroken', descKey: 'heartbrokenDesc', color: 'bg-rose-100 dark:bg-rose-900/30 border-rose-300 dark:border-rose-700' },
  { mood: 'HYPE', emoji: '🔥', nameKey: 'hype', descKey: 'hypeDesc', color: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700' },
  { mood: 'CHILL', emoji: '🌊', nameKey: 'chill', descKey: 'chillDesc', color: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700' },
  { mood: 'ROMANTIC', emoji: '💕', nameKey: 'romantic', descKey: 'romanticDesc', color: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700' },
  { mood: 'MYSTERIOUS', emoji: '🔮', nameKey: 'mysterious', descKey: 'mysteriousDesc', color: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700' },
  { mood: 'INSPIRED', emoji: '✨', nameKey: 'inspired', descKey: 'inspiredDesc', color: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' },
  { mood: 'MELANCHOLIC', emoji: '🌧️', nameKey: 'melancholic', descKey: 'melancholicDesc', color: 'bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-600' },
  { mood: 'COZY', emoji: '☕', nameKey: 'cozy', descKey: 'cozyDesc', color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
];

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelect: (mood: MoodType) => void;
  isLoading?: boolean;
}

export function MoodSelector({ selectedMood, onSelect, isLoading }: MoodSelectorProps) {
  const { t } = useI18n();

  return (
    <div>
      <h2 className="text-sm font-medium text-[var(--text-primary)] mb-3">{t.mood.selectMood}</h2>
      <div
        className="grid grid-cols-2 sm:grid-cols-5 gap-3"
        role="radiogroup"
        aria-label={t.mood.selectMood}
      >
        {MOODS.map((m) => {
          const isSelected = selectedMood === m.mood;
          return (
            <button
              key={m.mood}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isLoading}
              onClick={() => onSelect(m.mood)}
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 p-4 min-h-[88px] min-w-[88px] transition-all
                ${m.color}
                ${isSelected ? 'ring-2 ring-[var(--accent)] ring-offset-2 dark:ring-offset-gray-900 scale-105' : 'hover:scale-[1.02]'}
                ${isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-2xl mb-1" aria-hidden="true">{m.emoji}</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                {(t.mood as Record<string, string>)[m.nameKey]}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {(t.mood as Record<string, string>)[m.descKey]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export type { MoodType };
