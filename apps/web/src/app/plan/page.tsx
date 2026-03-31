'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Ticket,
  Film,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PublicHeader, PublicFooter } from '@/components/public-header';
import { useI18n } from '@/lib/i18n';

interface Screening {
  filmTitle: string;
  filmSlug: string;
  posterUrl?: string;
  cinemaName: string;
  time: string;
  ticketUrl?: string;
}

interface CalendarDay {
  date: string;
  screenings: Screening[];
}

interface CityOption {
  slug: string;
  name: string;
}

interface PlanResponse {
  username: string;
  displayName: string;
  watchlistSize: number;
  city: string;
  cities: CityOption[];
  totalMatches: number;
  calendar: CalendarDay[];
  error?: string;
  code?: string;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-NL', { weekday: 'short', day: 'numeric', month: 'short' });
}

function isToday(dateStr: string): boolean {
  const today = new Date();
  return dateStr === today.toISOString().split('T')[0];
}

function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T00:00:00').getDay();
}

const DUTCH_CITIES: CityOption[] = [
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
];

export default function PlanPage() {
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('amsterdam');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter your Letterboxd username.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSelectedDate(null);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), city }),
      });

      const data = await response.json();
      if (data.error && !data.calendar) {
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

  const selectedDayData = result?.calendar.find((d) => d.date === selectedDate);

  // Group screenings by film for the selected day
  const groupedByFilm = selectedDayData
    ? Object.values(
        selectedDayData.screenings.reduce<
          Record<string, { filmTitle: string; filmSlug: string; posterUrl?: string; showtimes: { cinemaName: string; time: string; ticketUrl?: string }[] }>
        >((acc, s) => {
          if (!acc[s.filmSlug]) {
            acc[s.filmSlug] = { filmTitle: s.filmTitle, filmSlug: s.filmSlug, posterUrl: s.posterUrl, showtimes: [] };
          }
          acc[s.filmSlug]!.showtimes.push({ cinemaName: s.cinemaName, time: s.time, ticketUrl: s.ticketUrl });
          return acc;
        }, {}),
      )
    : [];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-default)]">
            <Calendar className="h-8 w-8 text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Plan your <span className="text-[var(--accent)]">Cinema Week</span>
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-[var(--text-secondary)]">
            See when films from your Letterboxd watchlist are playing at cinemas near you.
          </p>
        </div>

        {/* Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Film className="h-5 w-5 text-[var(--text-muted)]" />
              Your Watchlist Calendar
            </CardTitle>
            <CardDescription>
              Enter your Letterboxd username and pick a city
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username">Letterboxd Username</Label>
                  <Input
                    id="username"
                    placeholder="username or letterboxd.com/username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <select
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  >
                    {DUTCH_CITIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finding screenings...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Show Calendar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Loading */}
        {isLoading && (
          <Card className="mb-8 overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 via-[var(--accent)]/5 to-transparent animate-pulse" />
              <CardContent className="relative py-8 text-center">
                <Calendar className="mx-auto h-10 w-10 text-[var(--accent)] animate-pulse mb-3" />
                <p className="text-lg font-medium text-[var(--text-primary)]">Matching your watchlist…</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Checking cinema schedules in {DUTCH_CITIES.find((c) => c.slug === city)?.name}.
                </p>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary bar */}
            <Card>
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Calendar for{' '}
                      <span className="font-medium text-[var(--accent)]">{result.displayName}</span>
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {result.watchlistSize} films on watchlist · {result.totalMatches} screenings found
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                    <MapPin className="h-3.5 w-3.5" />
                    {DUTCH_CITIES.find((c) => c.slug === result.city)?.name}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 30-day Calendar Grid */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Next 30 Days</CardTitle>
                <CardDescription>Days with screenings are highlighted. Click to see showtimes.</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Day-of-week headers */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <div key={d} className="text-center text-xs font-medium text-[var(--text-muted)] py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar cells */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty offset cells for the first day's weekday */}
                  {result.calendar[0] &&
                    Array.from({ length: getDayOfWeek(result.calendar[0].date) }).map((_, i) => (
                      <div key={`offset-${i}`} />
                    ))}

                  {result.calendar.map((day) => {
                    const hasScreenings = day.screenings.length > 0;
                    const isSelected = selectedDate === day.date;
                    const today = isToday(day.date);
                    const dateNum = new Date(day.date + 'T00:00:00').getDate();

                    return (
                      <button
                        key={day.date}
                        onClick={() => setSelectedDate(isSelected ? null : day.date)}
                        className={`
                          relative aspect-square rounded-lg text-sm font-medium transition-all
                          flex flex-col items-center justify-center
                          ${isSelected
                            ? 'bg-[var(--accent)] text-white ring-2 ring-[var(--ring)]'
                            : hasScreenings
                              ? 'bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)]/20 cursor-pointer'
                              : 'text-[var(--text-muted)] hover:bg-[var(--bg-accent)]'
                          }
                          ${today ? 'ring-1 ring-[var(--accent)]' : ''}
                        `}
                      >
                        <span>{dateNum}</span>
                        {hasScreenings && (
                          <span className={`text-[10px] leading-none ${isSelected ? 'text-white/80' : 'text-[var(--accent)]'}`}>
                            {day.screenings.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Selected Day Detail */}
            {selectedDate && selectedDayData && (
              <Card className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[var(--accent)]" />
                    {formatDateHeader(selectedDate)}
                  </CardTitle>
                  <CardDescription>
                    {selectedDayData.screenings.length} screening{selectedDayData.screenings.length !== 1 && 's'} from your watchlist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {groupedByFilm.length === 0 ? (
                    <p className="text-center text-sm text-[var(--text-muted)] py-6">
                      No watchlist films playing on this day.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {groupedByFilm.map((group) => (
                        <div
                          key={group.filmSlug}
                          className="flex gap-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-3"
                        >
                          {/* Poster */}
                          <div className="w-16 shrink-0">
                            {group.posterUrl ? (
                              <Image
                                src={group.posterUrl}
                                alt={group.filmTitle}
                                width={64}
                                height={96}
                                className="rounded-lg object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-24 w-16 items-center justify-center rounded-lg bg-[var(--bg-muted)]">
                                <Film className="h-5 w-5 text-[var(--text-muted)]" />
                              </div>
                            )}
                          </div>

                          {/* Film Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--text-primary)] text-sm truncate">
                              {group.filmTitle}
                            </p>
                            <div className="mt-2 space-y-1.5">
                              {group.showtimes.map((st, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                                  <Clock className="h-3 w-3 text-[var(--text-muted)] shrink-0" />
                                  <span className="font-medium">{st.time}</span>
                                  <span className="text-[var(--text-muted)]">at</span>
                                  <span className="truncate">{st.cinemaName}</span>
                                  {st.ticketUrl && (
                                    <a
                                      href={st.ticketUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-auto shrink-0"
                                    >
                                      <Ticket className="h-3 w-3 text-[var(--accent)] hover:text-[var(--accent-hover)]" />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* No matches message */}
            {result.totalMatches === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Film className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-4" />
                  <p className="text-[var(--text-secondary)]">
                    None of your watchlist films are currently screening in{' '}
                    {DUTCH_CITIES.find((c) => c.slug === result.city)?.name}.
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-2">
                    Try a different city or check back later — schedules update daily.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* How it works */}
        {!result && !isLoading && (
          <div className="mt-8">
            <h2 className="text-center text-xl font-semibold text-[var(--text-primary)] mb-8">
              How Plan works
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { icon: Film, title: 'Your watchlist', desc: 'We pull your Letterboxd watchlist' },
                { icon: MapPin, title: 'Local cinemas', desc: 'Cross-reference with screenings in your city' },
                { icon: Calendar, title: '30-day calendar', desc: 'See exactly when and where to go' },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="text-center">
                  <CardContent className="pt-6">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                      <Icon className="h-6 w-6 text-[var(--accent)]" />
                    </div>
                    <h3 className="font-medium text-[var(--text-primary)] mb-1">{title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
