'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Users, Film, Sparkles, ArrowRight, Popcorn, Calendar, MapPin, ChevronLeft, ChevronRight, Clock, Ticket } from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { useI18n } from '@/lib/i18n';

interface NowShowingFilm {
  id: string;
  title: string;
  year?: number;
  posterUrl: string;
  screeningCount: number;
}

interface CityOption {
  slug: string;
  name: string;
}

interface Screening {
  filmTitle: string;
  filmYear?: number;
  cinemaName: string;
  cinemaCity: string;
  date: string;
  time: string;
  ticketUrl?: string;
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
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-NL', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function HomePage() {
  const { t } = useI18n();
  const [films, setFilms] = useState<NowShowingFilm[]>([]);
  const [city, setCity] = useState('amsterdam');
  const [selectedFilm, setSelectedFilm] = useState<NowShowingFilm | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [allCityScreenings, setAllCityScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Fetch films + screenings from Filmladder (actual cinema data) when city changes
  useEffect(() => {
    setLoading(true);
    setSelectedFilm(null);
    setScreenings([]);
    fetch(`/api/now-showing?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((data) => {
        setFilms(data.films ?? []);
        setAllCityScreenings(data.screenings ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [city]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }, []);

  // Client-side title matching for filtering screenings by selected film
  const normalizeTitle = useCallback((title: string): string => {
    if (!title) return '';
    return title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }, []);

  // When a poster is clicked, filter screenings by that film title
  const handlePosterClick = useCallback((film: NowShowingFilm) => {
    setSelectedFilm(film);
    const normFilm = normalizeTitle(film.title);
    const matched = allCityScreenings.filter((s) => normalizeTitle(s.filmTitle) === normFilm);
    setScreenings(matched);
  }, [allCityScreenings, normalizeTitle]);

  // Group screenings by date
  const screeningsByDate = screenings.reduce<Record<string, Screening[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date]!.push(s);
    return acc;
  }, {});

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
              {t.common.explore}
            </Link>
            <Link href="/scan" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t.common.scan}
            </Link>
            <Link href="/plan" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t.common.plan}
            </Link>
            <Link href="/buddy" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t.common.buddy}
            </Link>
            <Link href="/about" className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t.common.about}
            </Link>
            <LanguageToggle />
            <ThemeToggleCompact />
            <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {t.common.login}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98]"
            >
              {t.common.getStarted}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-20 pb-12">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text-primary)] text-center leading-[1.1]">
          {t.home.heroTitle1}
          <br />
          <span className="text-[var(--accent)]">{t.home.heroTitle2}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-center text-lg leading-relaxed text-[var(--text-secondary)]">
          {t.home.heroSubtitle}
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            {t.common.getStarted}
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-7 py-3.5 text-sm font-semibold text-[var(--text-primary)] shadow-sm hover:bg-[var(--bg-accent)] transition-colors active:scale-[0.98]"
          >
            {t.common.getLucky}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Now Showing Carousel */}
      {loading ? (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            {t.common.loading}
          </div>
        </section>
      ) : films.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t.home.nowPlaying}</h2>
              <p className="text-sm text-[var(--text-muted)]">{t.home.clickPoster}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* City selector */}
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-transparent text-sm font-medium text-[var(--text-secondary)] border-none focus:outline-none cursor-pointer"
                >
                  {DUTCH_CITIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              {/* Nav arrows */}
              <button onClick={() => scroll('left')} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scroll('right')} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scrollable poster strip */}
          <div
            ref={carouselRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {films.map((film) => (
              <button
                key={film.id}
                onClick={() => handlePosterClick(film)}
                className={`shrink-0 group relative rounded-xl overflow-hidden transition-all duration-200 ${
                  selectedFilm?.id === film.id
                    ? 'ring-2 ring-[var(--accent)] scale-[1.02]'
                    : 'hover:scale-[1.03] hover:shadow-lg'
                }`}
              >
                {film.posterUrl ? (
                  <Image
                    src={film.posterUrl}
                    alt={film.title}
                    width={140}
                    height={210}
                    className="rounded-xl object-cover"
                    unoptimized
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent && !parent.querySelector('.poster-fallback')) {
                        const fb = document.createElement('div');
                        fb.className = 'poster-fallback flex h-[210px] w-[140px] items-center justify-center rounded-xl bg-[var(--bg-accent)] p-2 text-center';
                        const span = document.createElement('span');
                        span.className = 'text-xs text-[var(--text-muted)]';
                        span.textContent = film.title;
                        fb.appendChild(span);
                        parent.insertBefore(fb, img);
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-[210px] w-[140px] items-center justify-center rounded-xl bg-[var(--bg-accent)] p-2 text-center">
                    <span className="text-xs text-[var(--text-muted)]">{film.title}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white font-medium truncate">{film.title}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Showtimes panel */}
          {selectedFilm && (
            <div className="mt-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start gap-4">
                {selectedFilm.posterUrl ? (
                  <Image
                    src={selectedFilm.posterUrl}
                    alt={selectedFilm.title}
                    width={80}
                    height={120}
                    className="rounded-lg object-cover shrink-0"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-[120px] w-[80px] items-center justify-center rounded-lg bg-[var(--bg-accent)] shrink-0 p-1 text-center">
                    <span className="text-xs text-[var(--text-muted)]">{selectedFilm.title}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text-primary)]">{selectedFilm.title}</h3>
                  {selectedFilm.year && <p className="text-xs text-[var(--text-muted)] mt-0.5">{selectedFilm.year}</p>}
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    {selectedFilm.screeningCount} {t.explore.showtimes}
                  </p>
                </div>
              </div>

              {screenings.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--text-muted)]">
                  {t.home.noShowtimes} {DUTCH_CITIES.find((c) => c.slug === city)?.name} {t.home.forThisFilm}
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {Object.entries(screeningsByDate)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(0, 7)
                    .map(([date, dayScreenings]) => (
                      <div key={date}>
                        <p className="text-xs font-medium text-[var(--text-muted)] mb-1.5">
                          {formatDate(date)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dayScreenings
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((s, i) => (
                              s.ticketUrl ? (
                              <a
                                key={i}
                                href={s.ticketUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-accent)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] transition-colors"
                              >
                                <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                                <span className="font-medium">{s.time}</span>
                                <span className="text-[var(--text-muted)]">·</span>
                                <span className="truncate max-w-[120px]">{s.cinemaName}</span>
                                <Ticket className="h-3 w-3 text-[var(--accent)]" />
                              </a>
                              ) : (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-accent)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)]"
                              >
                                <Clock className="h-3 w-3 text-[var(--text-muted)]" />
                                <span className="font-medium">{s.time}</span>
                                <span className="text-[var(--text-muted)]">·</span>
                                <span className="truncate max-w-[120px]">{s.cinemaName}</span>
                              </span>
                              )
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Features */}
      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-5">
          {[
            { icon: Film, title: t.home.featureImport, desc: t.home.featureImportDesc, href: '/explore' },
            { icon: Users, title: t.home.featureDiscover, desc: t.home.featureDiscoverDesc, href: '/scan' },
            { icon: Heart, title: t.home.featureConnect, desc: t.home.featureConnectDesc, href: '/signup' },
            { icon: Calendar, title: t.home.featurePlan, desc: t.home.featurePlanDesc, href: '/plan' },
            { icon: Popcorn, title: t.home.featureBuddy, desc: t.home.featureBuddyDesc, href: '/buddy' },
          ].map(({ icon: Icon, title, desc, href }) => (
            <Link key={title} href={href} className="flex flex-col items-center text-center p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 hover:shadow-sm transition-all group">
              <Icon className="h-6 w-6 text-[var(--accent)] mb-2.5 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-[var(--text-primary)] mb-1 text-sm">{title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{desc}</p>
            </Link>
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
            <Link href="/explore" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.explore}</Link>
            <Link href="/scan" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.scan}</Link>
            <Link href="/plan" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.plan}</Link>
            <Link href="/buddy" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.buddy}</Link>
            <Link href="/about" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.about}</Link>
            <Link href="/privacy" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.privacy}</Link>
            <Link href="/terms" className="hover:text-[var(--text-secondary)] transition-colors">{t.common.terms}</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
