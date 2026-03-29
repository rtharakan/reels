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
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-100 dark:border-slate-700 bg-[var(--bg-primary)]/95 backdrop-blur-sm" role="navigation" aria-label="Main navigation">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
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
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-[var(--text-muted)] hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
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
