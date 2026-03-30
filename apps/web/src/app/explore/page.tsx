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
  ChevronDown,
  Popcorn,
  ExternalLink,
} from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useI18n } from '@/lib/i18n';

/** Group date ideas by film title + date so multiple showtimes collapse. */
interface GroupedScreening {
  filmTitle: string;
  date: string;
  showtimes: { cinemaName: string; time: string; ticketUrl?: string }[];
}

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
  dateIdeasSource?: 'watchlist' | 'interests';
  city: string | null;
  cities: CityOption[];
  error?: string;
  code?: string;
}

function getCompatibilityLabel(score: number): { text: string; color: string; emoji: string } {
  if (score >= 0.5) return { text: 'Soul Mates', color: 'text-[var(--accent)]', emoji: '💕' };
  if (score >= 0.3) return { text: 'Great Match', color: 'text-[var(--accent)]', emoji: '🎬' };
  if (score >= 0.15) return { text: 'Good Vibes', color: 'text-[var(--text-secondary)]', emoji: '✨' };
  if (score >= 0.05) return { text: 'Some Overlap', color: 'text-[var(--text-muted)]', emoji: '🎞️' };
  return { text: 'Opposites Attract?', color: 'text-[var(--text-muted)]', emoji: '🌙' };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function groupDateIdeas(ideas: DateIdea[]): GroupedScreening[] {
  const groups = new Map<string, GroupedScreening>();
  for (const idea of ideas) {
    const key = `${idea.filmTitle}::${idea.date}`;
    const existing = groups.get(key);
    if (existing) {
      existing.showtimes.push({
        cinemaName: idea.cinemaName,
        time: idea.time,
        ticketUrl: idea.ticketUrl,
      });
    } else {
      groups.set(key, {
        filmTitle: idea.filmTitle,
        date: idea.date,
        showtimes: [{ cinemaName: idea.cinemaName, time: idea.time, ticketUrl: idea.ticketUrl }],
      });
    }
  }
  for (const group of groups.values()) {
    group.showtimes.sort((a, b) => a.time.localeCompare(b.time));
  }
  return Array.from(groups.values());
}

export default function ExplorePage() {
  const { t } = useI18n();
  const [user1, setUser1] = useState('');
  const [user2, setUser2] = useState('');
  const [city, setCity] = useState('amsterdam');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
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
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-semibold text-[var(--text-primary)]">Reels</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/scan">
              <Button variant="ghost" size="sm">{t.common.scan}</Button>
            </Link>
            <Link href="/plan">
              <Button variant="ghost" size="sm">{t.common.plan}</Button>
            </Link>
            <LanguageToggle />
            <ThemeToggleCompact />
            <Link href="/login">
              <Button variant="ghost" size="sm">{t.common.login}</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">{t.common.getStarted}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-default)]">
            <Heart className="h-8 w-8 text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
            {t.explore.title} <span className="text-[var(--accent)]">{t.explore.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-[var(--text-secondary)]">
            {t.explore.subtitle}
          </p>
        </div>

        {/* Match Form */}
        <Card className="mx-auto max-w-2xl mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[var(--text-muted)]" />
              {t.explore.compareProfiles}
            </CardTitle>
            <CardDescription>
              {t.explore.compareDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="user1">{t.explore.person1}</Label>
                  <Input
                    id="user1"
                    placeholder="username or letterboxd.com/username"
                    value={user1}
                    onChange={(e) => setUser1(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user2">{t.explore.person2}</Label>
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
                  {t.explore.cityLabel}
                </Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isLoading}
                  className="flex h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] transition-colors"
                >
                  {cities.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
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
                    {t.explore.fetching}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t.explore.findMatch}
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
              <div className="relative bg-[var(--bg-card)] p-8 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--accent-soft),transparent_70%)]" />
                <div className="relative">
                  <p className="text-5xl mb-2">{compatibility.emoji}</p>
                  <h2 className={`text-3xl font-bold ${compatibility.color}`}>
                    {compatibility.text}
                  </h2>
                  <p className="mt-2 text-6xl font-bold text-[var(--text-primary)]">
                    {Math.round(result.match.combinedScore * 100)}%
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{t.explore.compatibilityScore}</p>
                </div>
              </div>

              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="rounded-xl bg-[var(--bg-accent)] p-4">
                    <p className="text-sm text-[var(--text-secondary)]">{result.user1.displayName}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{result.user1.filmCount}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.explore.films}</p>
                  </div>
                  <div className="rounded-xl bg-[var(--bg-accent)] p-4">
                    <p className="text-sm text-[var(--text-secondary)]">{result.user2.displayName}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">{result.user2.filmCount}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.explore.films}</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-[var(--accent)]">
                      {result.match.sharedFilmsCount}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{t.explore.sharedFilms}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--accent)]">
                      {result.match.sharedLikedCount}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{t.explore.bothLiked}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--accent)]">
                      {result.match.sharedWatchedCount}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{t.explore.bothWatched}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Shared Films / Date Ideas */}
            <Tabs defaultValue="shared" className="mx-auto max-w-2xl">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="shared" className="flex items-center gap-1.5">
                  <Film className="h-4 w-4" />
                  {t.explore.sharedFilmsTab} ({result.match.sharedFilmsCount})
                </TabsTrigger>
                <TabsTrigger value="dates" className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {t.explore.dateIdeasTab} ({result.dateIdeas.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="shared">
                {result.match.sharedFilms.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Film className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-4" />
                      <p className="text-[var(--text-secondary)]">{t.explore.noSharedFilms}</p>
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
                        <div className="aspect-[2/3] overflow-hidden rounded-xl bg-[var(--bg-accent)] relative">
                          {film.posterUrl ? (
                            <Image
                              src={film.posterUrl}
                              alt={film.title}
                              width={180}
                              height={270}
                              loading="lazy"
                              className="h-full w-full object-cover transition-all group-hover:scale-105 group-hover:opacity-90"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'flex h-full items-center justify-center p-2 text-center';
                                  fallback.innerHTML = `<span class="text-xs text-[var(--text-muted)]">${film.title}</span>`;
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center p-2 text-center">
                              <span className="text-xs text-[var(--text-muted)]">{film.title}</span>
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 text-xs text-[var(--text-secondary)] truncate">{film.title}</p>
                        {film.year && (
                          <p className="text-xs text-[var(--text-muted)]">{film.year}</p>
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
                      <Calendar className="mx-auto h-12 w-12 text-[var(--text-muted)] mb-4" />
                      <p className="text-[var(--text-secondary)]">
                        {result.match.sharedFilmsCount === 0
                          ? 'No shared films to screen — explore each other\'s taste!'
                          : `No shared films currently in theaters in ${cities.find((c) => c.slug === city)?.name || city}. Try another city!`}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {result.dateIdeasSource === 'interests' && (
                      <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                        <p className="font-medium text-[var(--accent)] mb-0.5">Based on your shared interests</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          These films are currently playing and match your combined taste in genres, likes, and viewing history — not from your watchlists.
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Screenings in{' '}
                      <Badge variant="secondary">
                        {cities.find((c) => c.slug === city)?.name || city}
                      </Badge>
                    </p>
                    {groupDateIdeas(result.dateIdeas).map((group) => {
                      const groupKey = `${group.filmTitle}::${group.date}`;
                      const isExpanded = expandedGroups.has(groupKey);
                      const hasMultiple = group.showtimes.length > 1;
                      return (
                        <Card key={groupKey} className="overflow-hidden">
                          <button
                            type="button"
                            className="flex w-full items-center gap-4 p-4 text-left hover:bg-[var(--bg-accent)] transition-colors"
                            onClick={() => {
                              if (!hasMultiple) return;
                              setExpandedGroups((prev) => {
                                const next = new Set(prev);
                                if (next.has(groupKey)) next.delete(groupKey);
                                else next.add(groupKey);
                                return next;
                              });
                            }}
                            aria-expanded={hasMultiple ? isExpanded : undefined}
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
                              <Ticket className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--text-primary)] truncate">
                                {group.filmTitle}
                              </p>
                              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(group.date)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {hasMultiple
                                    ? `${group.showtimes.length} showtimes`
                                    : `${group.showtimes[0]?.time ?? ''} \u00B7 ${group.showtimes[0]?.cinemaName ?? ''}`}
                                </span>
                              </div>
                            </div>
                            {hasMultiple && (
                              <ChevronDown className={`h-4 w-4 text-[var(--text-muted)] shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            )}
                            {!hasMultiple && group.showtimes[0]?.ticketUrl && (
                              <a
                                href={group.showtimes[0]?.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button size="sm" variant="outline" className="shrink-0">
                                  Tickets
                                  <ChevronRight className="h-3 w-3" />
                                </Button>
                              </a>
                            )}
                          </button>

                          {hasMultiple && isExpanded && (
                            <div className="border-t border-[var(--border-default)]">
                              {group.showtimes.map((st, idx) => (
                                <div
                                  key={`${st.cinemaName}-${st.time}-${idx}`}
                                  className="flex items-center justify-between px-4 py-3 pl-20 border-b border-[var(--border-default)] last:border-b-0"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[var(--text-primary)] truncate">{st.cinemaName}</p>
                                    <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                                      <Clock className="h-3 w-3" /> {st.time}
                                    </p>
                                  </div>
                                  {st.ticketUrl && (
                                    <a
                                      href={st.ticketUrl}
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
                              ))}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <Card className="mx-auto max-w-2xl bg-[var(--bg-card)] border-[var(--border-default)]">
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Sparkles className="h-8 w-8 text-[var(--accent)] mb-3" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {t.explore.wantMore}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm">
                  {t.explore.wantMoreDesc}
                </p>
                <Link href="/signup">
                  <Button>
                    {t.explore.joinFree}
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
              {t.explore.howItWorks}
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                    <Users className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">{t.explore.stepProfiles}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t.explore.stepProfilesDesc}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                    <Heart className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">{t.explore.stepMatch}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t.explore.stepMatchDesc}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                    <Ticket className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">{t.explore.stepDate}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t.explore.stepDateDesc}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Scoring explanation */}
            <div className="mt-12 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-soft">
              <h3 className="font-semibold text-[var(--text-primary)] mb-3">{t.explore.scoringTitle}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                {t.explore.scoringDesc}
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                <div className="rounded-xl bg-[var(--bg-accent)] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Liked Films</span>
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">30%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Films you both hearted — the strongest signal.</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-accent)] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">High Ratings</span>
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">25%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Films you both rated highly.</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-accent)] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Genre Taste</span>
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">20%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">How similar your genre preferences are.</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-accent)] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Watched Films</span>
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">15%</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">Films you&apos;ve both seen.</p>
                </div>
                <div className="rounded-xl bg-[var(--bg-accent)] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Watchlist</span>
                    <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-full">10%</span>
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
          <div className="mx-auto max-w-2xl mt-4 mb-8 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-soft">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">{t.explore.scoreBreakdown}</h3>
            <div className="grid gap-2 grid-cols-3 sm:grid-cols-5 text-center">
              {[
                { label: 'Liked', value: result.match.likedOverlap, weight: '30%' },
                { label: 'Rated', value: result.match.ratedOverlap, weight: '25%' },
                { label: 'Genre', value: result.match.genreScore, weight: '20%' },
                { label: 'Watched', value: result.match.watchedOverlap, weight: '15%' },
                { label: 'Watchlist', value: result.match.watchlistOverlap, weight: '10%' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-[var(--bg-accent)] p-3">
                  <p className="text-lg font-bold text-[var(--text-primary)]">{Math.round(s.value * 100)}%</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                  <p className="text-xs font-medium text-[var(--accent)]">{s.weight}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-default)] mt-16">
        <div className="mx-auto max-w-5xl px-4 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Popcorn className="h-4 w-4" />
            <span>Reels</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">
              {t.common.home}
            </Link>
            <Link href="/login" className="hover:text-[var(--text-secondary)] transition-colors">
              {t.common.login}
            </Link>
            <Link href="/signup" className="hover:text-[var(--text-secondary)] transition-colors">
              {t.common.signup}
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">
              {t.common.privacy}
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">
              {t.common.terms}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
