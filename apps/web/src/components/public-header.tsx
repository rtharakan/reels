'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popcorn, ChevronDown } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useI18n } from '@/lib/i18n';

const MAIN_NAV_LINKS = [
  { href: '/explore', key: 'explore' },
  { href: '/scan', key: 'scan' },
  { href: '/plan', key: 'plan' },
  { href: '/buddy', key: 'buddy' },
] as const;

const MORE_NAV_LINKS = [
  { href: '/about', key: 'about' },
  { href: '/help', key: 'help' },
  { href: '/features', key: 'features' },
] as const;

export function PublicHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const labels: Record<string, string> = {
    explore: t.common.explore,
    scan: t.common.scan,
    plan: t.common.plan,
    buddy: t.common.buddy,
    about: t.common.about,
    help: t.common.help,
    features: t.common.features,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

  const isMoreActive = MORE_NAV_LINKS.some(
    ({ href }) => pathname === href || pathname?.startsWith(href + '/'),
  );

  return (
    <header className="border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Popcorn className="h-5 w-5 text-[var(--accent)]" />
          <span className="text-base font-bold text-[var(--text-primary)]">Reels</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          {MAIN_NAV_LINKS.map(({ href, key }) => {
            const isActive = pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
                }`}
              >
                {labels[key]}
              </Link>
            );
          })}

          {/* More dropdown */}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs sm:text-sm font-medium transition-colors inline-flex items-center gap-1 ${
                isMoreActive
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
              }`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              {t.common.more}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] py-1 shadow-lg z-50">
                {MORE_NAV_LINKS.map(({ href, key }) => {
                  const isActive = pathname === href || pathname?.startsWith(href + '/');
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className={`block px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
                      }`}
                    >
                      {labels[key]}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 ml-1 border-l border-[var(--border-default)] pl-2">
            <LanguageToggle />
            <ThemeToggleCompact />
          </div>
          <Link
            href="/login"
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
          >
            {t.common.login}
          </Link>
          <Link
            href="/signup"
            className="whitespace-nowrap rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98]"
          >
            {t.common.getStarted}
          </Link>
        </nav>
      </div>
    </header>
  );
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
