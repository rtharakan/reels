import Link from 'next/link';
import {
  Popcorn,
  BarChart3,
  Info,
  Heart,
  Star,
  Film,
  Eye,
  List,
  Shield,
  Code2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-bold text-[var(--text-primary)]">Reels</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/explore" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Explore
            </Link>
            <Link href="/scan" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Scan
            </Link>
            <Link href="/plan" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Plan
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

      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">About Reels</h1>
        <p className="text-[var(--text-secondary)] mb-12 text-lg">
          A film-driven social matching platform. No algorithms guessing what you like &mdash;
          your actual film taste does the matching.
        </p>

        {/* 5-Signal Scoring */}
        <section id="scoring" className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
              <BarChart3 className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">5-Signal Scoring</h2>
          </div>

          <p className="text-[var(--text-secondary)] mb-6">
            We analyze five signals from your Letterboxd profile for a comprehensive compatibility score.
            The same algorithm powers Explore, Scan, and logged-in matching.
          </p>

          <div className="space-y-4 mb-8">
            {[
              { icon: Heart, label: 'Liked Films', weight: '30%', desc: 'Films you both hearted on Letterboxd. The strongest signal of shared taste.' },
              { icon: Star, label: 'High Ratings', weight: '25%', desc: 'Films you both rated 4 stars or higher. Strong conscious appreciation.' },
              { icon: Film, label: 'Genre Similarity', weight: '20%', desc: 'Overall genre taste profile compatibility across all your films.' },
              { icon: Eye, label: 'Watched Films', weight: '15%', desc: 'Films you have both seen. Shared viewing experience.' },
              { icon: List, label: 'Watchlist Overlap', weight: '10%', desc: 'Films you both want to watch. Shared curiosity and intent.' },
            ].map(({ icon: Icon, label, weight, desc }) => (
              <div key={label} className="flex items-start gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] shrink-0">
                  <Icon className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[var(--text-primary)]">{label}</span>
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">{weight}</span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-[var(--bg-accent)] border border-[var(--border-default)] p-4">
            <Info className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" />
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Missing signals (e.g., no liked films) contribute 0 and do not penalize your score.
              The more data you have on Letterboxd, the more accurate your matches.
            </p>
          </div>
        </section>

        {/* Match Labels */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Match Labels</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Soul Mates', range: '50%+', emoji: '💕' },
              { label: 'Great Match', range: '30-49%', emoji: '🎬' },
              { label: 'Good Vibes', range: '15-29%', emoji: '✨' },
              { label: 'Film Friends', range: '5-14%', emoji: '🎞️' },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-3">
                <span className="text-xl">{m.emoji}</span>
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{m.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{m.range} compatibility</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">How It Works</h2>
          <div className="space-y-6">
            {[
              { step: '1', title: 'Import your watchlist', desc: 'Sign up and connect your Letterboxd profile. We scrape your public watchlist, liked films, and watched films.' },
              { step: '2', title: 'Get matched', desc: 'Our matching engine computes scores against all other users using the 5-signal algorithm. You get 10 curated cards per day.' },
              { step: '3', title: 'Express interest', desc: 'Swipe through your daily matches. When two people both express interest, it\'s a mutual match.' },
              { step: '4', title: 'Connect', desc: 'Mutual matches see shared films, genre overlap, and a "why you matched" breakdown. Plan a cinema date.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-white text-sm font-bold shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)]">{title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Features</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'Explore', desc: 'Compare any two Letterboxd profiles without an account', href: '/explore' },
              { title: 'Scan', desc: 'Discover Letterboxd users with similar taste automatically', href: '/scan' },
              { title: 'Dutch Cinema Dates', desc: 'Find shared films screening in cities across the Netherlands' },
              { title: 'Daily Discover Feed', desc: '10 curated match cards per day with finite, ethical UX' },
              { title: 'Dual Intent', desc: 'Looking for friends, dates, or both. You control the mode.' },
              { title: 'Safety First', desc: 'Block and report within 2 taps from any profile view' },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-[var(--text-primary)]">{f.title}</h3>
                  {'href' in f && f.href && (
                    <Link href={f.href} className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech & Privacy */}
        <section className="mb-16">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Privacy & Technical</h2>
          <div className="space-y-3">
            {[
              { icon: Shield, title: 'Privacy by Design', desc: 'We only access your public Letterboxd data. No demographic matching, no dark patterns, GDPR-compliant with full data export and deletion.' },
              { icon: Code2, title: 'Open Source', desc: 'Reels is open-source on GitHub. The matching algorithm, scraping logic, and UI are all transparent and auditable.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-soft)] shrink-0">
                  <Icon className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">{title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-[var(--accent)] mb-3" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Ready to find your film twins?</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            No account needed to try Explore or Scan. Create an account for daily matching.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors active:scale-[0.98]"
            >
              Try Explore
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-accent)] transition-colors active:scale-[0.98]"
            >
              Try Scan
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98]"
            >
              Create Account
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] mt-12">
        <div className="mx-auto max-w-5xl px-4 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <Popcorn className="h-3.5 w-3.5" />
            <span>Reels</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Home</Link>
            <Link href="/explore" className="hover:text-[var(--text-secondary)] transition-colors">Explore</Link>
            <Link href="/scan" className="hover:text-[var(--text-secondary)] transition-colors">Scan</Link>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">Terms</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
