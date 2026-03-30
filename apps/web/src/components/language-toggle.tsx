'use client';

import { useI18n, type Locale } from '@/lib/i18n';
import { Globe } from 'lucide-react';

const LABELS: Record<Locale, string> = {
  en: 'EN',
  nl: 'NL',
};

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  const toggle = () => {
    setLocale(locale === 'en' ? 'nl' : 'en');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
      aria-label={`Switch to ${locale === 'en' ? 'Dutch' : 'English'}`}
      title={locale === 'en' ? 'Nederlands' : 'English'}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{LABELS[locale]}</span>
    </button>
  );
}
