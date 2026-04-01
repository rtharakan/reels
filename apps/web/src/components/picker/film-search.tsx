'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';

interface FilmResult {
  tmdbId: number;
  title: string;
  year: number | null;
  posterPath: string | null;
  overview: string | null;
}

interface FilmSearchProps {
  onSelect: (film: { tmdbId: number; title: string; year: number | null; posterPath: string | null }) => void;
}

export function FilmSearch({ onSelect }: FilmSearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = trpc.picker.searchFilms.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 1 },
  );

  const results: FilmResult[] = data?.results ?? [];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      e.preventDefault();
      const film = results[selectedIndex];
      onSelect({ tmdbId: film.tmdbId, title: film.title, year: film.year, posterPath: film.posterPath });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelectedIndex(-1); }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          placeholder={t.picker.searchFilms}
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="film-search-results"
          aria-activedescendant={selectedIndex >= 0 ? `film-${selectedIndex}` : undefined}
        />
      </div>

      {isLoading && debouncedQuery && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 rounded-lg bg-[var(--bg-card)] p-3 animate-pulse">
              <div className="w-12 h-16 rounded bg-[var(--bg-accent)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-[var(--bg-accent)]" />
                <div className="h-3 w-3/4 rounded bg-[var(--bg-accent)]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && debouncedQuery && results.length === 0 && (
        <p className="text-center text-sm text-[var(--text-muted)] py-4">{t.picker.noResults}</p>
      )}

      {results.length > 0 && (
        <ul ref={listRef} id="film-search-results" role="listbox" className="space-y-2">
          {results.map((film, idx) => (
            <li
              key={film.tmdbId}
              id={`film-${idx}`}
              role="option"
              aria-selected={idx === selectedIndex}
              className={`flex gap-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-3 cursor-pointer transition-colors ${
                idx === selectedIndex ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-accent)]'
              }`}
              onClick={() => onSelect({ tmdbId: film.tmdbId, title: film.title, year: film.year, posterPath: film.posterPath })}
            >
              {film.posterPath ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w92${film.posterPath}`}
                  alt={film.title}
                  width={48}
                  height={72}
                  className="rounded object-cover"
                />
              ) : (
                <div className="w-12 h-[72px] rounded bg-[var(--bg-accent)] flex items-center justify-center text-xs text-[var(--text-muted)]">🎬</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-[var(--text-primary)] truncate">{film.title}</div>
                {film.year && <div className="text-xs text-[var(--text-muted)]">{film.year}</div>}
                {film.overview && (
                  <div className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{film.overview}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
