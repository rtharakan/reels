'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  Radar,
  Calendar,
  Users,
  Ticket,
  Sparkles,
  Menu,
  X,
  Settings,
  HelpCircle,
  ChevronDown,
  Film,
  Info,
  Lightbulb,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggleCompact } from '@/components/theme-toggle';

interface NavHeaderProps {
  isAuthenticated: boolean;
}

const FEATURE_LINKS = [
  { href: '/explore', icon: Heart, i18nKey: 'match' as const },
  { href: '/scan', icon: Radar, i18nKey: 'filmTwins' as const },
  { href: '/plan', icon: Calendar, i18nKey: 'cinemaWeek' as const },
  { href: '/buddy', icon: Users, i18nKey: 'buddy' as const },
  { href: '/picker', icon: Ticket, i18nKey: 'picker' as const },
  { href: '/mood', icon: Sparkles, i18nKey: 'moodReels' as const },
] as const;

export function NavHeader({ isAuthenticated }: NavHeaderProps) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + '/');

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

  // Close mobile menu on outside click — exclude the hamburger button itself
  // to prevent the mousedown/touchstart handler racing with the button's onClick
  useEffect(() => {
    function handleOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      const insideMenu = mobileRef.current?.contains(target);
      const insideButton = hamburgerRef.current?.contains(target);
      if (!insideMenu && !insideButton) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('touchstart', handleOutside, { passive: true });
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [mobileOpen]);

  // Close on ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
        setMoreOpen(false);
      }
    },
    [],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const navLabels: Record<string, string> = {
    match: t.nav.match,
    filmTwins: t.nav.filmTwins,
    cinemaWeek: t.nav.cinemaWeek,
    buddy: t.nav.buddy,
    picker: t.nav.picker,
    moodReels: t.nav.moodReels,
  };

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href={isAuthenticated ? '/discover' : '/'} className="flex items-center gap-2 shrink-0" aria-label="Reels home">
          <Film className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
          <span className="text-base font-bold text-[var(--text-primary)]">Reels</span>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {FEATURE_LINKS.map(({ href, icon: Icon, i18nKey }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                isActive(href)
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
              }`}
              aria-current={isActive(href) ? 'page' : undefined}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{navLabels[i18nKey]}</span>
            </Link>
          ))}

          {/* More dropdown for secondary items — visible to all users */}
          <div ref={moreRef} className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              {t.common.more}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div
                className="fixed right-auto top-[56px] w-44 max-h-[80vh] overflow-y-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] py-1 shadow-lg z-50"
                role="menu"
              >
                <Link
                  href="/about"
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isActive('/about')
                      ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-accent)]'
                  }`}
                  role="menuitem"
                >
                  <Info className="h-4 w-4" aria-hidden="true" />
                  {t.common.about}
                </Link>
                <Link
                  href="/help"
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isActive('/help')
                      ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-accent)]'
                  }`}
                  role="menuitem"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" />
                  {t.nav.help}
                </Link>
                <Link
                  href="/features"
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    isActive('/features')
                      ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-accent)]'
                  }`}
                  role="menuitem"
                >
                  <Lightbulb className="h-4 w-4" aria-hidden="true" />
                  {t.common.features}
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/settings"
                    className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isActive('/settings')
                        ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-accent)]'
                    }`}
                    role="menuitem"
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    {t.nav.settings}
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right side: language toggle + auth + mobile hamburger */}
        <div className="flex items-center gap-2">
          <ThemeToggleCompact />
          <LanguageToggle />

          {!isAuthenticated && (
            <Link
              href="/login"
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              {t.nav.signIn}
            </Link>
          )}

          {/* Mobile hamburger — visible below md */}
          <button
            ref={hamburgerRef}
            type="button"
            className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>

    {/* Mobile slide-in overlay — rendered outside the header so that
        the header's backdrop-filter stacking context does not break
        position:fixed on iOS Safari */}
    {mobileOpen && (
      <div
        ref={mobileRef}
        id="mobile-nav-menu"
        className="md:hidden fixed inset-x-0 top-[57px] bottom-0 z-40 bg-[var(--bg-primary)] overflow-y-auto motion-safe:animate-in motion-safe:slide-in-from-top-2"
        role="navigation"
        aria-label="Mobile navigation"
      >
          <nav className="flex flex-col p-4 gap-1">
            {FEATURE_LINKS.map(({ href, icon: Icon, i18nKey }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 min-h-[44px] text-sm font-medium transition-colors ${
                  isActive(href)
                    ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
                }`}
                aria-current={isActive(href) ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {navLabels[i18nKey]}
              </Link>
            ))}

            <hr className="my-2 border-[var(--border-default)]" />

            <Link
              href="/about"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 min-h-[44px] text-sm font-medium transition-colors ${
                isActive('/about')
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
              }`}
            >
              <Info className="h-5 w-5" aria-hidden="true" />
              {t.common.about}
            </Link>
            <Link
              href="/help"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 min-h-[44px] text-sm font-medium transition-colors ${
                isActive('/help')
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
              }`}
            >
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
              {t.nav.help}
            </Link>
            <Link
              href="/features"
              className={`flex items-center gap-3 rounded-xl px-4 py-3 min-h-[44px] text-sm font-medium transition-colors ${
                isActive('/features')
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
              }`}
            >
              <Lightbulb className="h-5 w-5" aria-hidden="true" />
              {t.common.features}
            </Link>

            {isAuthenticated && (
              <Link
                href="/settings"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 min-h-[44px] text-sm font-medium transition-colors ${
                  isActive('/settings')
                    ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-accent)]'
                }`}
              >
                <Settings className="h-5 w-5" aria-hidden="true" />
                {t.nav.settings}
              </Link>
            )}

            {!isAuthenticated && (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 min-h-[44px] text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                {t.nav.signIn}
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
