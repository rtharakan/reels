import Link from 'next/link';
import { Heart, Users, Film, Sparkles, ArrowRight, Popcorn } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-indigo-400" />
            <span className="text-lg font-bold text-white">Reels</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Explore
            </Link>
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/25">
          <Heart className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl text-center">
          Find your people
          <br />
          <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
            through film
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-zinc-400">
          Import your Letterboxd watchlist, discover matches, and connect with people who share your taste in cinema.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Create Account
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-100 shadow-sm hover:bg-zinc-800 transition-colors"
          >
            Try Explore
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950/50">
              <Film className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Import Watchlist</h3>
            <p className="text-sm text-zinc-500">
              Connect your Letterboxd to find matches based on real film taste
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-950/50">
              <Users className="h-6 w-6 text-pink-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Discover Matches</h3>
            <p className="text-sm text-zinc-500">
              Browse 10 curated matches daily — friends, dates, or both
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/50">
              <Heart className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Connect</h3>
            <p className="text-sm text-zinc-500">
              Mutual matches unlock chat — plan a cinema date together
            </p>
          </div>
        </div>
      </section>

      {/* Explore CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-2xl border border-indigo-900/50 bg-gradient-to-br from-indigo-950/30 to-pink-950/30 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No account needed</h2>
          <p className="text-zinc-400 mb-6 max-w-lg mx-auto">
            Try our Explore feature — compare any two Letterboxd profiles and see
            compatibility instantly. Find shared films screening in Dutch cinemas.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Try Explore Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <Popcorn className="h-4 w-4" />
            <span>Reels — Film-Driven Social Matching</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
