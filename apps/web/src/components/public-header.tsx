'use client';

import Link from 'next/link';
import { Popcorn } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { NavHeader } from '@/components/nav-header';

export function PublicHeader() {
  return <NavHeader isAuthenticated={false} />;
}

export function PublicFooter() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-[var(--border-default)]">
      <div className="mx-auto max-w-5xl px-4 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <Popcorn className="h-3.5 w-3.5 text-[var(--accent)]" />
          <span>Reels</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/explore" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.explore}</Link>
          <Link href="/scan" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.scan}</Link>
          <Link href="/plan" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.plan}</Link>
          <Link href="/buddy" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.buddy}</Link>
          <Link href="/about" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.about}</Link>
          <Link href="/help" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.help ?? 'Help'}</Link>
          <Link href="/features" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.features ?? 'Feature Requests'}</Link>
          <span className="text-[var(--border-default)]">·</span>
          <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.privacy}</Link>
          <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.terms}</Link>
        </nav>
      </div>
    </footer>
  );
}
