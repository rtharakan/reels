'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Ticket, MapPin, Film, Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { FilmSearch } from '@/components/picker/film-search';
import { ShowtimeSelector } from '@/components/picker/showtime-selector';

interface SelectedFilm {
  tmdbId: number;
  title: string;
  year: number | null;
  posterPath: string | null;
}

interface NowShowingFilm {
  id: string;
  title: string;
  year?: number;
  posterUrl: string;
  screeningCount: number;
}

const DUTCH_CITIES = [
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

type Step = 'pick-film' | 'select-showtimes' | 'plan-created';

export default function PickerPage() {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('pick-film');
  const [selectedFilm, setSelectedFilm] = useState<SelectedFilm | null>(null);
  const [nowPlayingFilmTitle, setNowPlayingFilmTitle] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [city, setCity] = useState('amsterdam');
  const [copied, setCopied] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Now playing films from filmladder
  const [nowPlaying, setNowPlaying] = useState<NowShowingFilm[]>([]);
  const [nowLoading, setNowLoading] = useState(true);

  const { data: myPlans } = trpc.picker.myPlans.useQuery(undefined, { retry: false });
  const createPlan = trpc.picker.create.useMutation();

  // Fetch now-playing films when city changes
  useEffect(() => {
    setNowLoading(true);
    fetch(`/api/now-showing?city=${encodeURIComponent(city)}`)
      .then((r) => r.json())
      .then((data) => {
        setNowPlaying(data.films ?? []);
        setNowLoading(false);
      })
      .catch(() => setNowLoading(false));
  }, [city]);

  const handleSelectNowPlaying = useCallback((film: NowShowingFilm) => {
    setNowPlayingFilmTitle(film.title);
    setSelectedFilm(null);
    setStep('select-showtimes');
  }, []);

  const handleSelectSearch = useCallback((film: { tmdbId: number; title: string; year: number | null; posterPath: string | null }) => {
    setSelectedFilm(film);
    setNowPlayingFilmTitle(film.title);
    setStep('select-showtimes');
  }, []);

  const handleCreatePlan = async (showtimes: Array<{ cinemaName: string; cinemaCity: string; date: string; time: string; ticketUrl?: string; isManualEntry: boolean }>) => {
    const filmTitle = selectedFilm?.title ?? nowPlayingFilmTitle;
    const result = await createPlan.mutateAsync({
      filmTitle,
      filmTmdbId: selectedFilm?.tmdbId,
      filmPosterPath: selectedFilm?.posterPath ?? undefined,
      filmYear: selectedFilm?.year ?? undefined,
      pathway: 'FILM_FIRST',
      city,
      showtimes,
    });
    setShareUrl(result.shareUrl);
    setPlanId(result.planId);
    setStep('plan-created');
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      VOTING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      EXPIRED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      ARCHIVED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
    };
    const labels: Record<string, string> = { VOTING: t.picker.voting, CONFIRMED: t.picker.confirmed, EXPIRED: t.picker.expired, ARCHIVED: t.picker.archived };
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${colors[status] ?? ''}`}>{labels[status] ?? status}</span>;
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Ticket className="h-6 w-6 text-[var(--accent)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t.picker.title} <span className="text-[var(--accent)]">{t.picker.titleAccent}</span>
          </h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">{t.picker.subtitle}</p>
      </div>

      {step === 'pick-film' && (
        <div className="space-y-6">
          {/* City selector */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t.home.nowPlaying}</h2>
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
          </div>

          {/* Now Playing Grid */}
          {nowLoading ? (
            <div className="flex items-center gap-2 py-12 justify-center text-sm text-[var(--text-muted)]">
              <Film className="h-4 w-4 animate-spin text-[var(--accent)]" />
              {t.common.loading}
            </div>
          ) : nowPlaying.length > 0 ? (
            <>
              <p className="text-xs text-[var(--text-muted)]">{t.home.clickPoster}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {nowPlaying.map((film) => (
                  <button
                    key={film.id}
                    onClick={() => handleSelectNowPlaying(film)}
                    className="group relative rounded-xl overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:shadow-lg"
                  >
                    {film.posterUrl ? (
                      <Image
                        src={film.posterUrl}
                        alt={film.title}
                        width={140}
                        height={210}
                        className="rounded-xl object-cover w-full"
                        unoptimized
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-[210px] w-full items-center justify-center rounded-xl bg-[var(--bg-accent)] p-2 text-center">
                        <span className="text-xs text-[var(--text-muted)]">{film.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs text-white font-medium truncate">{film.title}</p>
                      <p className="text-[10px] text-white/70">{film.screeningCount} {t.explore.showtimes}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)] text-center py-8">{t.picker.noShowtimes}</p>
          )}

          {/* Search fallback */}
          <div className="border-t border-[var(--border-default)] pt-4">
            <button
              type="button"
              onClick={() => setShowSearch(!showSearch)}
              className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
            >
              <Search className="h-4 w-4" />
              {t.picker.searchFilms}
            </button>
            {showSearch && (
              <div className="mt-4">
                <FilmSearch onSelect={handleSelectSearch} />
              </div>
            )}
          </div>

          {/* My Plans section */}
          {myPlans?.plans && myPlans.plans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{t.picker.myPlans}</h2>
              <div className="space-y-2">
                {myPlans.plans.map((plan) => (
                  <a
                    key={plan.id}
                    href={`/picker/${plan.id}`}
                    className="flex items-center justify-between rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-4 transition-colors hover:bg-[var(--bg-accent)]"
                  >
                    <div>
                      <span className="font-medium text-[var(--text-primary)]">{plan.filmTitle}</span>
                      <span className="ml-2 text-xs text-[var(--text-muted)]">{plan.participantCount} {t.picker.participants.toLowerCase()}</span>
                    </div>
                    {statusBadge(plan.status)}
                  </a>
                ))}
              </div>
            </div>
          )}
          {myPlans?.plans?.length === 0 && (
            <p className="text-center text-sm text-[var(--text-muted)] py-4">{t.picker.noPlans}</p>
          )}
        </div>
      )}

      {step === 'select-showtimes' && (
        <div>
          <button
            type="button"
            onClick={() => { setStep('pick-film'); setSelectedFilm(null); setNowPlayingFilmTitle(''); }}
            className="mb-4 text-sm text-[var(--accent)] hover:underline"
          >
            ← {t.picker.pathwayATitle}
          </button>
          <ShowtimeSelector
            filmTitle={selectedFilm?.title ?? nowPlayingFilmTitle}
            city={city}
            onCityChange={setCity}
            onSubmit={handleCreatePlan}
            isCreating={createPlan.isPending}
          />
        </div>
      )}

      {step === 'plan-created' && shareUrl && (
        <div className="space-y-6 text-center">
          <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">🎬 {t.picker.planCreated}</h2>
            <div className="mt-4 flex items-center gap-2 justify-center">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 max-w-md rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
              >
                {copied ? t.picker.linkCopied : t.picker.copyLink}
              </button>
            </div>
            {planId && (
              <a href={`/picker/${planId}`} className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">
                View Plan →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
