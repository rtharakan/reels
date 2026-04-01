'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';

interface Showtime {
  cinemaName: string;
  cinemaCity: string;
  date: string;
  time: string;
  ticketUrl?: string;
  isManualEntry: boolean;
  selected: boolean;
}

interface ShowtimeSelectorProps {
  filmTitle: string;
  city: string;
  cinema?: string;
  date?: string;
  onCityChange: (city: string) => void;
  onSubmit: (showtimes: Array<{ cinemaName: string; cinemaCity: string; date: string; time: string; ticketUrl?: string; isManualEntry: boolean }>) => void;
  isCreating: boolean;
}

export function ShowtimeSelector({ filmTitle, city, cinema, date, onCityChange: _onCityChange, onSubmit, isCreating }: ShowtimeSelectorProps) {
  const { t } = useI18n();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ cinemaName: '', cinemaCity: city, date: '', time: '', ticketUrl: '' });
  const [initialized, setInitialized] = useState(false);

  const { data, isLoading } = trpc.picker.getShowtimes.useQuery(
    { filmTitle, city, cinema, date },
  );

  // Sync fetched showtimes to state when data arrives
  if (data && !initialized) {
    setShowtimes(
      data.showtimes.map((s) => ({
        ...s,
        ticketUrl: s.ticketUrl ?? undefined,
        isManualEntry: false,
        selected: false,
      })),
    );
    if (data.source === 'manual') setShowManual(true);
    setInitialized(true);
  }

  const toggleShowtime = (idx: number) => {
    setShowtimes((prev) => prev.map((s, i) => (i === idx ? { ...s, selected: !s.selected } : s)));
  };

  const addManualShowtime = () => {
    if (!manual.cinemaName || !manual.date || !manual.time) return;
    setShowtimes((prev) => [
      ...prev,
      { ...manual, ticketUrl: manual.ticketUrl || undefined, isManualEntry: true, selected: true },
    ]);
    setManual({ cinemaName: '', cinemaCity: city, date: '', time: '', ticketUrl: '' });
  };

  const selectedShowtimes = showtimes.filter((s) => s.selected);

  const handleSubmit = () => {
    onSubmit(selectedShowtimes.map(({ selected: _selected, ...s }) => s));
  };

  // Group by cinema
  const grouped = showtimes.reduce<Record<string, Showtime[]>>((acc, s, idx) => {
    const key = s.cinemaName;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...s, selected: showtimes[idx]?.selected ?? false });
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">{t.picker.selectShowtimes}</h2>

      {isLoading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-[var(--bg-accent)]" />
          ))}
        </div>
      )}

      {!isLoading && showtimes.length > 0 && (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cinemaName, items]) => (
            <div key={cinemaName} className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden">
              <div className="px-4 py-2 bg-[var(--bg-accent)] text-sm font-medium text-[var(--text-primary)]">
                {cinemaName} · {items[0]?.cinemaCity}
              </div>
              <div className="divide-y divide-[var(--border-default)]">
                {items.map((s) => {
                  const idx = showtimes.findIndex(
                    (st) => st.cinemaName === s.cinemaName && st.date === s.date && st.time === s.time,
                  );
                  return (
                    <label
                      key={`${s.date}-${s.time}`}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--bg-accent)] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={showtimes[idx]?.selected ?? false}
                        onChange={() => toggleShowtime(idx)}
                        className="h-4 w-4 rounded border-[var(--border-default)] text-[var(--accent)]"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{s.date}</span>
                      <span className="text-sm font-medium text-[var(--text-primary)]">{s.time}</span>
                      {s.isManualEntry && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">{t.picker.manualEntry}</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && showtimes.length === 0 && !showManual && (
        <div className="text-center py-8">
          <p className="text-sm text-[var(--text-muted)]">{t.picker.noShowtimes}</p>
          <button type="button" onClick={() => setShowManual(true)} className="mt-2 text-sm text-[var(--accent)] hover:underline">
            {t.picker.addShowtime}
          </button>
        </div>
      )}

      {/* Manual showtime entry */}
      <div>
        <button
          type="button"
          onClick={() => setShowManual((p) => !p)}
          className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
        >
          <Plus className="h-4 w-4" />
          {t.picker.addShowtime}
        </button>

        {showManual && (
          <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={manual.cinemaName}
                onChange={(e) => setManual((m) => ({ ...m, cinemaName: e.target.value }))}
                placeholder={t.picker.cinemaName}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={manual.cinemaCity}
                onChange={(e) => setManual((m) => ({ ...m, cinemaCity: e.target.value }))}
                placeholder={t.picker.cinemaCity}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={manual.date}
                onChange={(e) => setManual((m) => ({ ...m, date: e.target.value }))}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
              />
              <input
                type="time"
                value={manual.time}
                onChange={(e) => setManual((m) => ({ ...m, time: e.target.value }))}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
              />
            </div>
            <input
              type="url"
              value={manual.ticketUrl}
              onChange={(e) => setManual((m) => ({ ...m, ticketUrl: e.target.value }))}
              placeholder={t.picker.ticketUrl}
              className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addManualShowtime}
              disabled={!manual.cinemaName || !manual.date || !manual.time}
              className="rounded-lg bg-[var(--bg-accent)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-accent)]/80 disabled:opacity-50 transition"
            >
              {t.picker.addShowtime}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={selectedShowtimes.length === 0 || isCreating}
        className="w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isCreating ? '...' : `${t.picker.createPlan} (${selectedShowtimes.length} ${t.picker.selectShowtimes.toLowerCase()})`}
      </button>
    </div>
  );
}
