import Link from 'next/link';
import { Heart, Users, Film, Sparkles, ArrowRight, Popcorn, BarChart3, Info } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-blue-100 dark:border-slate-700 bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold text-[var(--text-primary)]">Reels</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/explore" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Explore
            </Link>
            <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-600">
          <Heart className="h-10 w-10 text-blue-500" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] text-center leading-tight">
          Find your people
          <br />
          <span className="text-blue-400 dark:text-blue-300">
            through film
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-center text-base sm:text-lg leading-relaxed text-[var(--text-secondary)]">
          Import your Letterboxd watchlist, discover matches, and connect with people who share your taste in cinema.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Create Account
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-[var(--text-primary)] shadow-sm hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
          >
            Try Explore
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-700">
              <Film className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Import Watchlist</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Connect your Letterboxd to find matches based on real film taste
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-700">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Discover Matches</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Browse 10 curated matches daily — friends, dates, or both
            </p>
          </div>
          <div className="rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-700">
              <Heart className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Connect</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Mutual matches unlock chat — plan a cinema date together
            </p>
          </div>
        </div>
      </section>

      {/* How Scoring Works */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-2xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-700">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">How We Score Compatibility</h2>
          </div>
          <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
            Your compatibility score is calculated by looking at five different signals from your Letterboxd profile. Each signal tells us something different about your film taste.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Liked Films</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">30%</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Films you both hearted on Letterboxd. This is the strongest signal — it means you both loved the same movies.
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">High Ratings</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">25%</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Films you both rated 4 stars or higher. Shows you both consciously appreciate the same cinema.
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Genre Taste</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">20%</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                How similar your genre preferences are across all your films. Even without overlap, similar taste counts.
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Watched Films</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">15%</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Films you have both seen. Shared viewing history shows you pick the same movies even if you rate them differently.
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Watchlist Overlap</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">10%</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Films on both your watchlists. Shared curiosity about the same upcoming films is a nice bonus.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-blue-50/50 dark:bg-slate-700/50 border border-blue-100 dark:border-slate-600 p-4">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              The Explore feature uses a simpler version based on watchlist overlap and genre similarity.
              When you create an account, we use the full 5-signal score for more accurate
              matching. Missing signals (e.g. no liked films) contribute 0 and do not penalize your score.
            </p>
          </div>
        </div>
      </section>

      {/* Explore CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-2xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No account needed</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-lg mx-auto">
            Try our Explore feature — compare any two Letterboxd profiles and see
            compatibility instantly. Find shared films screening in Dutch cinemas.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 dark:bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Try Explore Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-100 dark:border-slate-700">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Popcorn className="h-4 w-4" />
            <span>Reels — Film-Driven Social Matching</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/explore" className="hover:text-[var(--text-secondary)] transition-colors">
              Explore
            </Link>
            <Link href="/login" className="hover:text-[var(--text-secondary)] transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-[var(--text-secondary)] transition-colors">
              Sign up
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
