'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Users, User, Compass } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/discover', label: 'Discover', icon: Heart },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/matches', label: 'Matches', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-default)] bg-[var(--bg-card)]/90 backdrop-blur-xl" role="navigation" aria-label="Main navigation">
        <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === '/explore'
              ? pathname === '/explore'
              : href === '/discover'
                ? pathname === '/discover'
                : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-[11px] font-medium transition-all ${
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="pb-20">{children}</main>
    </div>
  );
}
