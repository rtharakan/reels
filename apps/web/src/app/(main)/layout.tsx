'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm" role="navigation" aria-label="Main navigation">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          <Link href="/discover" className={`flex flex-col items-center gap-1 px-4 py-2 text-xs ${pathname === '/discover' ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            Discover
          </Link>
          <Link href="/matches" className={`flex flex-col items-center gap-1 px-4 py-2 text-xs ${pathname?.startsWith('/matches') ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Matches
          </Link>
          <Link href="/profile" className={`flex flex-col items-center gap-1 px-4 py-2 text-xs ${pathname?.startsWith('/profile') ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Profile
          </Link>
        </div>
      </nav>
      <main className="pb-20">{children}</main>
    </div>
  );
}
