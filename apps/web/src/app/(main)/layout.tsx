'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Users, User, Compass, Popcorn, Settings, Radar, HelpCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: matches } = trpc.match.list.useQuery(undefined, { refetchInterval: 30000 });

  const navItems = [
    { href: '/discover', label: t.common.discover, icon: Heart },
    { href: '/explore', label: t.common.explore, icon: Compass },
    { href: '/buddy', label: t.common.buddy, icon: Popcorn },
    { href: '/matches', label: t.common.matches, icon: Users },
    { href: '/profile', label: t.common.profile, icon: User },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Top header bar for authenticated pages */}
      <header className="sticky top-0 z-50 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/discover" className="flex items-center gap-2" aria-label="Reels home">
            <Popcorn className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
            <span className="text-base font-bold text-[var(--text-primary)]">Reels</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/scan"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
              aria-label="Scan for film twins"
            >
              <Radar className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t.common.scan}</span>
            </Link>
            <Link
              href="/plan"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
            >
              <span className="hidden sm:inline">{t.common.plan}</span>
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
              aria-label="Help and FAQ"
            >
              <HelpCircle className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-card)]/90 backdrop-blur-xl safe-area-bottom"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/explore'
              ? pathname === '/explore'
              : href === '/discover'
                ? pathname === '/discover'
                : pathname?.startsWith(href);
            const matchCount = href === '/matches' ? (matches?.length ?? 0) : 0;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-[11px] font-medium transition-all ${
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} aria-hidden="true" />
                <span>{label}</span>
                {matchCount > 0 && href === '/matches' && (
                  <span className="absolute -top-0.5 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white" aria-label={`${matchCount} matches`}>
                    {matchCount > 99 ? '99+' : matchCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="pb-20" id="main-content">{children}</main>
    </div>
  );
}
