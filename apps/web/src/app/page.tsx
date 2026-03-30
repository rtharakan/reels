import Link from 'next/link';
import { Heart, Users, Film, Sparkles, ArrowRight, Popcorn } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-bold text-[var(--text-primary)]">Reels</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/explore" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Explore
            </Link>
            <Link href="/scan" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Scan
            </Link>
            <Link href="/about" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              About
            </Link>
            <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-28 pb-20">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] text-center leading-[1.1]">
          Find your people
          <br />
          <span className="text-[var(--accent)]">through film</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-center text-lg leading-relaxed text-[var(--text-secondary)]">
          Connect your Letterboxd. Discover who shares your taste. Meet.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Get Started
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-accent)] transition-colors active:scale-[0.98]"
          >
            Try Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Three features */}
      <section className="mx-auto max-w-3xl px-4 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Film, title: 'Import', desc: 'Your Letterboxd watchlist becomes your taste profile' },
            { icon: Users, title: 'Discover', desc: '10 curated matches daily based on real film taste' },
            { icon: Heart, title: 'Connect', desc: 'Mutual matches unlock chat and cinema date ideas' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
              <Icon className="h-7 w-7 text-[var(--accent)] mb-3" />
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)]">
        <div className="mx-auto max-w-5xl px-4 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Popcorn className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Reels</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/explore" className="hover:text-[var(--text-secondary)] transition-colors">Explore</Link>
            <Link href="/scan" className="hover:text-[var(--text-secondary)] transition-colors">Scan</Link>
            <Link href="/about" className="hover:text-[var(--text-secondary)] transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
