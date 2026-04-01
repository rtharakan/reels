'use client';

import Image from 'next/image';
import { ExternalLink, Copy } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useState } from 'react';

interface PlanSummaryCardProps {
  filmTitle: string;
  filmYear: number | null;
  filmPosterPath: string | null;
  cinemaName: string;
  cinemaCity: string;
  date: string;
  time: string;
  ticketUrl: string | null;
  participants: Array<{ displayName: string; isOrganizer: boolean }>;
  shareUrl: string;
}

export function PlanSummaryCard({
  filmTitle, filmYear, filmPosterPath,
  cinemaName, cinemaCity, date, time, ticketUrl,
  participants, shareUrl,
}: PlanSummaryCardProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-green-200 dark:border-green-800 bg-[var(--bg-card)] overflow-hidden">
      <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 text-sm font-medium text-green-800 dark:text-green-300">
        ✓ {t.picker.confirmed}
      </div>
      <div className="p-6 flex flex-col sm:flex-row gap-6">
        {filmPosterPath && (
          <Image
            src={`https://image.tmdb.org/t/p/w185${filmPosterPath}`}
            alt={filmTitle}
            width={120}
            height={180}
            className="rounded-lg object-cover self-start"
          />
        )}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{filmTitle}</h3>
            {filmYear && <p className="text-sm text-[var(--text-muted)]">{filmYear}</p>}
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-[var(--text-primary)]">📍 {cinemaName}, {cinemaCity}</p>
            <p className="text-[var(--text-primary)]">📅 {date} · {time}</p>
          </div>
          {ticketUrl && (
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <ExternalLink className="h-4 w-4" />
              {t.picker.buyTickets}
            </a>
          )}
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] mb-1">{t.picker.participants}</p>
            <div className="flex flex-wrap gap-1">
              {participants.map((p) => (
                <span
                  key={p.displayName}
                  className="inline-flex items-center rounded-full bg-[var(--bg-accent)] px-2 py-0.5 text-xs text-[var(--text-secondary)]"
                >
                  {p.displayName}
                  {p.isOrganizer && <span className="ml-1 text-[var(--accent)]">★</span>}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)] hover:underline"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? t.picker.linkCopied : t.picker.copyLink}
          </button>
        </div>
      </div>
    </div>
  );
}
