import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
          <span className="text-indigo-400">Reels</span>
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-400">
          Connect with people who share your film taste. Import your Letterboxd watchlist, discover
          matches, and find your people through cinema.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            href="/signup"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Get Started
          </Link>
          <Link href="/login" className="text-sm font-semibold leading-6 text-zinc-300 hover:text-white">
            Sign in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
      <footer className="absolute bottom-6 text-center text-xs text-zinc-600">
        <Link href="/privacy" className="hover:text-zinc-400">Privacy Policy</Link>
        {' · '}
        <Link href="/terms" className="hover:text-zinc-400">Terms of Service</Link>
      </footer>
    </main>
  );
}
