'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Users, User, Popcorn } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { NavHeader } from '@/components/nav-header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const { data: matches } = trpc.match.list.useQuery(undefined, { refetchInterval: 30000 });

  const navItems = [
    { href: '/discover', label: t.common.discover, icon: Heart },
    { href: '/explore', label: t.nav.match, icon: Heart },
    { href: '/buddy', label: t.nav.buddy, icon: Popcorn },
    { href: '/matches', label: t.common.matches, icon: Users },
    { href: '/profile', label: t.common.profile, icon: User },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <NavHeader isAuthenticated={true} />

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
