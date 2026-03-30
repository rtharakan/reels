import Link from 'next/link';
import { Heart, Users, Film, Sparkles, ArrowRight, Popcorn, BarChart3, Info } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-card)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">Reels</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/explore" className="hidden sm:inline text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Explore
            </Link>
            <Link href="/login" className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-[var(--accent-hover)] transition-all active:scale-[0.98]"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-default)]">
          <Heart className="h-8 w-8 text-[var(--accent)]" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--text-primary)] text-center leading-[1.1]">
          Find your people
          <br />
          <span className="text-[var(--accent)]">through film</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-center text-base leading-relaxed text-[var(--text-secondary)]">
          Import your Letterboxd watchlist, discover matches, and connect with people who share your taste in cinema.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white shadow-soft hover:bg-[var(--accent-hover)] transition-all active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Create Account
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] shadow-soft hover:bg-[var(--bg-accent)] transition-all"
          >
            Try Explore
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Film, title: 'Import Watchlist', desc: 'Connect your Letterboxd to match on real film taste' },
            { icon: Users, title: 'Discover Matches', desc: 'Browse 10 curated matches daily — friends, dates, or both' },
            { icon: Heart, title: 'Connect', desc: 'Mutual matches unlock chat — plan a cinema date together' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-center shadow-soft">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                <Icon className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1.5">{title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How Scoring Works */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 shadow-soft">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">5-Signal Scoring</h2>
          </div>

          <div className="grid gap-3 grid-cols-3 sm:grid-cols-5 mb-6">
            {[
              { label: 'Liked Films', weight: '30%' },
              { label: 'High Ratings', weight: '25%' },
              { label: 'Genre Taste', weight: '20%' },
              { label: 'Watched Films', weight: '15%' },
              { label: 'Watchlist', weight: '10%' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-[var(--bg-accent)] p-3 text-center">
                <span className="text-lg font-bold text-[var(--accent)]">{s.weight}</span>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-[var(--bg-accent)] border border-[var(--border-default)] p-4">
            <Info className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Both the Explore feature and logged-in matching use the same 5-signal algorithm.
              Missing signals (e.g. no liked films) contribute 0 and do not penalize your score.
            </p>
          </div>
        </div>
      </section>

      {/* Explore CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center shadow-soft">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No account needed</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-lg mx-auto text-sm leading-relaxed">
            Compare any two Letterboxd profiles and see compatibility instantly.
            Find shared films screening in Dutch cinemas.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white shadow-soft hover:bg-[var(--accent-hover)] transition-all active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Try Explore Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)]">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Popcorn className="h-4 w-4" />
            <span>Reels</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/explore" className="hover:text-[var(--text-secondary)] transition-colors">Explore</Link>
            <Link href="/login" className="hover:text-[var(--text-secondary)] transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-[var(--text-secondary)] transition-colors">Sign up</Link>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
