import Link from 'next/link';
import { Heart, Users, Film, Sparkles, ArrowRight, Popcorn } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-emerald-100/50 bg-stone-50/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-stone-500" />
            <span className="text-lg font-bold text-stone-800">Reels</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/explore" className="text-sm font-medium text-slate-500 hover:text-stone-800 transition-colors">
              Explore
            </Link>
            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-stone-800 transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 border border-slate-200">
          <Heart className="h-10 w-10 text-stone-500" />
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-stone-800 sm:text-7xl text-center">
          Find your people
          <br />
          <span className="text-slate-500">
            through film
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-slate-500">
          Import your Letterboxd watchlist, discover matches, and connect with people who share your taste in cinema.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Create Account
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm hover:bg-emerald-50 transition-colors"
          >
            Try Explore
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <Film className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="font-semibold text-stone-800 mb-2">Import Watchlist</h3>
            <p className="text-sm text-slate-400">
              Connect your Letterboxd to find matches based on real film taste
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <Users className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="font-semibold text-stone-800 mb-2">Discover Matches</h3>
            <p className="text-sm text-slate-400">
              Browse 10 curated matches daily — friends, dates, or both
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-white p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <Heart className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="font-semibold text-stone-800 mb-2">Connect</h3>
            <p className="text-sm text-slate-400">
              Mutual matches unlock chat — plan a cinema date together
            </p>
          </div>
        </div>
      </section>

      {/* Explore CTA */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
          <h2 className="text-2xl font-bold text-stone-800 mb-2">No account needed</h2>
          <p className="text-slate-500 mb-6 max-w-lg mx-auto">
            Try our Explore feature — compare any two Letterboxd profiles and see
            compatibility instantly. Find shared films screening in Dutch cinemas.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Try Explore Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-100/50">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Popcorn className="h-4 w-4" />
            <span>Reels — Film-Driven Social Matching</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-500 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-500 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
