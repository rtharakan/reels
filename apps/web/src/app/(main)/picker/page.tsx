'use client';

import { useState } from 'react';
import { Ticket, ArrowRight } from 'lucide-react';
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

type Step = 'choose-pathway' | 'search-film' | 'select-showtimes' | 'plan-created';

export default function PickerPage() {
  const { t } = useI18n();
  const [step, setStep] = useState<Step>('choose-pathway');
  const [pathway, setPathway] = useState<'FILM_FIRST' | 'FULLY_SPECIFIED'>('FILM_FIRST');
  const [selectedFilm, setSelectedFilm] = useState<SelectedFilm | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [city, setCity] = useState('amsterdam');
  const [copied, setCopied] = useState(false);

  // Pathway B fields
  const [bFilmTitle, setBFilmTitle] = useState('');
  const [bDate, setBDate] = useState('');
  const [bCinema, setBCinema] = useState('');

  const { data: myPlans } = trpc.picker.myPlans.useQuery(undefined, { retry: false });
  const createPlan = trpc.picker.create.useMutation();

  const handleCreatePlan = async (showtimes: Array<{ cinemaName: string; cinemaCity: string; date: string; time: string; ticketUrl?: string; isManualEntry: boolean }>) => {
    const filmTitle = pathway === 'FILM_FIRST' ? selectedFilm?.title ?? '' : bFilmTitle;
    const result = await createPlan.mutateAsync({
      filmTitle,
      filmTmdbId: selectedFilm?.tmdbId,
      filmPosterPath: selectedFilm?.posterPath ?? undefined,
      filmYear: selectedFilm?.year ?? undefined,
      pathway,
      city: pathway === 'FILM_FIRST' ? city : undefined,
      cinema: pathway === 'FULLY_SPECIFIED' ? bCinema : undefined,
      targetDate: pathway === 'FULLY_SPECIFIED' ? bDate : undefined,
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

      {step === 'choose-pathway' && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => { setPathway('FILM_FIRST'); setStep('search-film'); }}
              className="group rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-left transition-all hover:border-[var(--accent)] hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t.picker.pathwayATitle}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{t.picker.pathwayADesc}</p>
              <ArrowRight className="mt-4 h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </button>
            <button
              type="button"
              onClick={() => { setPathway('FULLY_SPECIFIED'); setStep('search-film'); }}
              className="group rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 text-left transition-all hover:border-[var(--accent)] hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{t.picker.pathwayBTitle}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{t.picker.pathwayBDesc}</p>
              <ArrowRight className="mt-4 h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
            </button>
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
            <p className="text-center text-sm text-[var(--text-muted)] py-8">{t.picker.noPlans}</p>
          )}
        </div>
      )}

      {step === 'search-film' && (
        <div className="space-y-6">
          {pathway === 'FULLY_SPECIFIED' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t.picker.filmTitle}</label>
                <input
                  type="text"
                  value={bFilmTitle}
                  onChange={(e) => setBFilmTitle(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)]"
                  placeholder={t.picker.filmTitle}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t.picker.date}</label>
                  <input type="date" value={bDate} onChange={(e) => setBDate(e.target.value)} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{t.picker.cinema}</label>
                  <input type="text" value={bCinema} onChange={(e) => setBCinema(e.target.value)} className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm" placeholder={t.picker.cinemaName} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('select-showtimes')}
                disabled={!bFilmTitle.trim()}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {t.picker.selectShowtimes}
              </button>
            </div>
          )}

          {pathway === 'FILM_FIRST' && (
            <FilmSearch
              onSelect={(film) => {
                setSelectedFilm(film);
                setStep('select-showtimes');
              }}
            />
          )}
        </div>
      )}

      {step === 'select-showtimes' && (
        <ShowtimeSelector
          filmTitle={pathway === 'FILM_FIRST' ? selectedFilm?.title ?? '' : bFilmTitle}
          city={city}
          cinema={pathway === 'FULLY_SPECIFIED' ? bCinema : undefined}
          date={pathway === 'FULLY_SPECIFIED' ? bDate : undefined}
          onCityChange={setCity}
          onSubmit={handleCreatePlan}
          isCreating={createPlan.isPending}
        />
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
