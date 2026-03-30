'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Users,
  Film,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  Sparkles,
  Loader2,
  ChevronRight,
  Popcorn,
  ExternalLink,
} from 'lucide-react';

interface SharedFilm {
  letterboxdSlug: string;
  title: string;
  year?: number;
  posterUrl?: string;
  letterboxdUrl?: string;
}

interface DateIdea {
  filmTitle: string;
  cinemaName: string;
  date: string;
  time: string;
  ticketUrl?: string;
}

interface CityOption {
  slug: string;
  name: string;
}

interface MatchResponse {
  user1: { username: string; displayName: string; filmCount: number };
  user2: { username: string; displayName: string; filmCount: number };
  match: {
    overlapScore: number;
    genreScore: number;
    combinedScore: number;
    likedOverlap: number;
    ratedOverlap: number;
    watchedOverlap: number;
    watchlistOverlap: number;
    sharedFilmsCount: number;
    sharedFilms: SharedFilm[];
    sharedLikedCount: number;
    sharedWatchedCount: number;
  };
  dateIdeas: DateIdea[];
  city: string | null;
  cities: CityOption[];
  error?: string;
  code?: string;
}

function getCompatibilityLabel(score: number): { text: string; color: string; emoji: string } {
  if (score >= 0.5) return { text: 'Soul Mates', color: 'text-blue-700 dark:text-blue-300', emoji: '💕' };
  if (score >= 0.3) return { text: 'Great Match', color: 'text-blue-600 dark:text-blue-400', emoji: '🎬' };
  if (score >= 0.15) return { text: 'Good Vibes', color: 'text-slate-600 dark:text-slate-300', emoji: '✨' };
  if (score >= 0.05) return { text: 'Some Overlap', color: 'text-slate-500 dark:text-slate-400', emoji: '🎞️' };
  return { text: 'Opposites Attract?', color: 'text-slate-400 dark:text-slate-500', emoji: '🌙' };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export default function ExplorePage() {
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [city, setCity] = useState('amsterdam');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [cities] = useState<CityOption[]>([
    { slug: 'amsterdam', name: 'Amsterdam' },
    { slug: 'rotterdam', name: 'Rotterdam' },
    { slug: 'den-haag', name: 'Den Haag' },
    { slug: 'utrecht', name: 'Utrecht' },
    { slug: 'eindhoven', name: 'Eindhoven' },
    { slug: 'groningen', name: 'Groningen' },
    { slug: 'haarlem', name: 'Haarlem' },
    { slug: 'leiden', name: 'Leiden' },
    { slug: 'nijmegen', name: 'Nijmegen' },
    { slug: 'arnhem', name: 'Arnhem' },
    { slug: 'maastricht', name: 'Maastricht' },
    { slug: 'breda', name: 'Breda' },
    { slug: 'tilburg', name: 'Tilburg' },
    { slug: 'delft', name: 'Delft' },
    { slug: 'deventer', name: 'Deventer' },
    { slug: 'den-bosch', name: "'s-Hertogenbosch" },
    { slug: 'leeuwarden', name: 'Leeuwarden' },
    { slug: 'zwolle', name: 'Zwolle' },
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user1.trim() || !user2.trim()) {
      setError('Please enter both Letterboxd usernames or profile links.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/explore/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1: user1.trim(),
          user2: user2.trim(),
          city,
        }),
      });

      const data = await response.json();

      if (data.error && !data.match) {
        setError(data.error);
        return;
      }

      setResult(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const compatibility = result?.match
    ? getCompatibilityLabel(result.match.combinedScore)
    : null;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-blue-100 dark:border-slate-700 bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-bold text-[var(--text-primary)]">Reels</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-600">
            <Heart className="h-8 w-8 text-blue-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
            Film Taste <span className="text-blue-400 dark:text-blue-300">Match</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-[var(--text-secondary)]">
            Enter two Letterboxd profiles and discover your film compatibility.
            Find shared favorites and plan a cinema date in the Netherlands.
          </p>
        </div>

        {/* Match Form */}
        <Card className="mx-auto max-w-2xl mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" />
              Compare Profiles
            </CardTitle>
            <CardDescription>
              Enter Letterboxd usernames or paste full profile links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="user1">Person 1</Label>
                  <Input
                    id="user1"
                    placeholder="username or letterboxd.com/username"
                    value={user1}
                    onChange={(e) => setUser1(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user2">Person 2</Label>
                  <Input
                    id="user2"
                    placeholder="username or letterboxd.com/username"
                    value={user2}
                    onChange={(e) => setUser2(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  City for date ideas (Netherlands)
                </Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  {cities.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching watchlists & matching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Find Your Match
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && compatibility && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Compatibility Score */}
            <Card className="mx-auto max-w-2xl overflow-hidden">
              <div className="relative bg-white dark:bg-slate-800 p-8 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)]" />
                <div className="relative">
                  <p className="text-5xl mb-2">{compatibility.emoji}</p>
                  <h2 className={`text-3xl font-bold ${compatibility.color}`}>
                    {compatibility.text}
                  </h2>
                  <p className="mt-2 text-6xl font-bold text-[var(--text-primary)]">
                    {Math.round(result.match.combinedScore * 100)}%
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">compatibility score</p>
                </div>
              </div>

              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-4">
                    <p className="text-sm text-[var(--text-secondary)]">{result.user1.displayName}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{result.user1.filmCount}</p>
                    <p className="text-xs text-[var(--text-muted)]">films</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-4">
                    <p className="text-sm text-[var(--text-secondary)]">{result.user2.displayName}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{result.user2.filmCount}</p>
                    <p className="text-xs text-[var(--text-muted)]">films</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {result.match.sharedFilmsCount}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">shared films</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500 dark:text-blue-300">
                      {result.match.sharedLikedCount}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">both liked</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-500 dark:text-blue-300">
                      {result.match.sharedWatchedCount}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">both watched</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Shared Films / Date Ideas */}
            <Tabs defaultValue="shared" className="mx-auto max-w-2xl">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="shared" className="flex items-center gap-1.5">
                  <Film className="h-4 w-4" />
                  Shared Films ({result.match.sharedFilmsCount})
                </TabsTrigger>
                <TabsTrigger value="dates" className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Date Ideas ({result.dateIdeas.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shared">
                {result.match.sharedFilms.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Film className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-[var(--text-secondary)]">No shared films found — maybe that&apos;s the charm!</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {result.match.sharedFilms.map((film) => (
                      <a
                        key={film.letterboxdSlug}
                        href={film.letterboxdUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <div className="aspect-[2/3] overflow-hidden rounded-lg bg-blue-50 dark:bg-slate-700 relative">
                          {film.posterUrl ? (
                            <Image
                              src={film.posterUrl}
                              alt={film.title}
                              width={180}
                              height={270}
                              loading="lazy"
                              className="h-full w-full object-cover transition-opacity group-hover:opacity-80"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center p-2 text-center">
                              <span className="text-xs text-slate-400 dark:text-slate-500">{film.title}</span>
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 truncate">{film.title}</p>
                        {film.year && (
                          <p className="text-xs text-slate-400 dark:text-slate-500">{film.year}</p>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="dates">
                {result.dateIdeas.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                      <p className="text-[var(--text-secondary)]">
                        {result.match.sharedFilmsCount === 0
                          ? 'No shared films to screen — explore each other\'s taste!'
                          : `No shared films currently in theaters in ${cities.find((c) => c.slug === city)?.name || city}. Try another city!`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Screenings in{' '}
                      <Badge variant="secondary">
                        {cities.find((c) => c.slug === city)?.name || city}
                      </Badge>
                    </p>
                    {result.dateIdeas.map((idea, i) => (
                      <Card key={`${idea.filmTitle}-${idea.date}-${idea.time}-${i}`}>
                        <div className="flex items-center gap-4 p-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-slate-700 text-blue-500 shrink-0">
                            <Ticket className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)] truncate">
                              {idea.filmTitle}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)] truncate">
                              {idea.cinemaName}
                            </p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(idea.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {idea.time}
                              </span>
                            </div>
                          </div>
                          {idea.ticketUrl && (
                            <a
                              href={idea.ticketUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="shrink-0">
                                Tickets
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <Card className="mx-auto max-w-2xl bg-white dark:bg-slate-800 border-blue-100 dark:border-slate-700">
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Sparkles className="h-8 w-8 text-blue-500 mb-3" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Want to find more film lovers?
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm">
                  Create a free Reels account to discover matches,
                  get personalized recommendations, and connect with people who share your taste.
                </p>
                <Link href="/signup">
                  <Button>
                    Join Reels — It&apos;s Free
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}

        {/* How it works section (shown when no results) */}
        {!result && !isLoading && (
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-xl font-semibold text-[var(--text-primary)] mb-8">
              How it works
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-700">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">Enter profiles</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Paste two Letterboxd usernames or profile links
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-700">
                    <Heart className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">See your match</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Discover shared films and your compatibility score
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-700">
                    <Ticket className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">Plan a date</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Find shared films playing at Dutch cinemas right now
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Scoring explanation */}
            <div className="mt-12 rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">How scoring works</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                We analyze five signals from your Letterboxd profile for a comprehensive compatibility score:
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Liked Films</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">30%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Films you both hearted — the strongest signal.</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">High Ratings</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">25%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Films you both rated highly.</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Genre Taste</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">20%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">How similar your genre preferences are.</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Watched Films</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">15%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Films you&apos;ve both seen.</p>
                </div>
                <div className="rounded-lg bg-blue-50 dark:bg-slate-700 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Watchlist</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">10%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Films on both your watchlists.</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Missing signals (e.g. no liked films) contribute 0 and don&apos;t penalize your score.
              </p>
            </div>
          </div>
        )}

        {/* Scoring breakdown shown with results */}
        {result && compatibility && (
          <div className="mx-auto max-w-2xl mt-4 mb-8 rounded-xl border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Score breakdown</h3>
            <div className="grid gap-2 grid-cols-3 sm:grid-cols-5 text-center">
              {[
                { label: 'Liked', value: result.match.likedOverlap, weight: '30%' },
                { label: 'Rated', value: result.match.ratedOverlap, weight: '25%' },
                { label: 'Genre', value: result.match.genreScore, weight: '20%' },
                { label: 'Watched', value: result.match.watchedOverlap, weight: '15%' },
                { label: 'Watchlist', value: result.match.watchlistOverlap, weight: '10%' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-blue-50 dark:bg-slate-700 p-3">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{Math.round(s.value * 100)}%</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                  <p className="text-xs font-medium text-blue-500 dark:text-blue-400">{s.weight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-100 dark:border-slate-700 mt-16">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Popcorn className="h-4 w-4" />
            <span>Reels — Film-Driven Social Matching</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">
              Home
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
    </div>
  );
}
