'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Film,
  MapPin,
  MessageCircle,
  Send,
  Ticket,
  UserPlus,
  Users,
  Loader2,
  X,
} from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/public-header';
import { useI18n } from '@/lib/i18n';
import { useSession } from '@/lib/auth-client';

interface CityOption {
  slug: string;
  name: string;
}

interface ShowOption {
  cinema: string;
  time: string;
  ticketUrl?: string;
}

interface FilmOption {
  title: string;
  year?: number;
  posterUrl?: string | null;
  shows: ShowOption[];
}

interface BuddyRequest {
  id: string;
  filmTitle: string;
  filmYear?: number;
  posterUrl?: string;
  cinemaName: string;
  city: string;
  date: string;
  time: string;
  ticketUrl?: string;
  maxBuddies: number;
  status: string;
  createdAt: string;
  creator: { id: string; name: string; image?: string };
  interests: { userId: string }[];
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; image?: string };
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

function getNextDates(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]!);
  }
  return dates;
}

export default function BuddyPage() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  // Tab state
  const [tab, setTab] = useState<'browse' | 'create'>('browse');

  // Create form state
  const [formCity, setFormCity] = useState('amsterdam');
  const [formDate, setFormDate] = useState(getNextDates(1)[0] ?? '');
  const [formFilms, setFormFilms] = useState<FilmOption[]>([]);
  const [formSelectedFilm, setFormSelectedFilm] = useState<FilmOption | null>(null);
  const [formSelectedShow, setFormSelectedShow] = useState<ShowOption | null>(null);
  const [formMaxBuddies, setFormMaxBuddies] = useState(1);
  const [formLoading, setFormLoading] = useState(false);
  const [formPosting, setFormPosting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [availableDates, setAvailableDates] = useState<string[]>(getNextDates(14));

  // Browse state
  const [browseCity, setBrowseCity] = useState('amsterdam');
  const [requests, setRequests] = useState<BuddyRequest[]>([]);
  const [browsLoading, setBrowsLoading] = useState(true);

  // Chat state
  const [chatRequestId, setChatRequestId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load screenings when city or date changes
  useEffect(() => {
    if (tab !== 'create') return;
    setFormLoading(true);
    setFormSelectedFilm(null);
    setFormSelectedShow(null);
    fetch(`/api/buddy/screenings?city=${encodeURIComponent(formCity)}&date=${encodeURIComponent(formDate)}`)
      .then((r) => r.json())
      .then((data) => {
        setFormFilms(data.films ?? []);
        if (data.availableDates?.length) setAvailableDates(data.availableDates);
        setFormLoading(false);
      })
      .catch(() => setFormLoading(false));
  }, [formCity, formDate, tab]);

  // Load buddy requests
  const loadRequests = useCallback(() => {
    setBrowsLoading(true);
    fetch(`/api/buddy?city=${encodeURIComponent(browseCity)}`)
      .then((r) => r.json())
      .then((data) => {
        setRequests(data.requests ?? []);
        setBrowsLoading(false);
      })
      .catch(() => setBrowsLoading(false));
  }, [browseCity]);

  useEffect(() => {
    if (tab === 'browse') loadRequests();
  }, [tab, loadRequests]);

  // Filter shows by selected cinema if a film is selected
  const filteredShows = formSelectedFilm?.shows ?? [];

  // Create request
  const handleCreate = async () => {
    if (!formSelectedFilm || !formSelectedShow || !userId) return;
    setFormPosting(true);
    try {
      const res = await fetch('/api/buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filmTitle: formSelectedFilm.title,
          filmYear: formSelectedFilm.year,
          posterUrl: formSelectedFilm.posterUrl,
          cinemaName: formSelectedShow.cinema,
          city: formCity,
          date: formDate,
          time: formSelectedShow.time,
          ticketUrl: formSelectedShow.ticketUrl,
          maxBuddies: formMaxBuddies,
        }),
      });
      if (res.ok) {
        setFormSuccess(true);
        setFormSelectedFilm(null);
        setFormSelectedShow(null);
        setTimeout(() => { setFormSuccess(false); setTab('browse'); loadRequests(); }, 1500);
      }
    } catch { /* ignore */ }
    setFormPosting(false);
  };

  // Express interest
  const handleJoin = async (requestId: string) => {
    if (!userId) return;
    await fetch(`/api/buddy/${requestId}/interest`, { method: 'POST' });
    loadRequests();
  };

  const handleLeave = async (requestId: string) => {
    if (!userId) return;
    await fetch(`/api/buddy/${requestId}/interest`, { method: 'DELETE' });
    loadRequests();
  };

  // Chat
  const openChat = useCallback(async (requestId: string) => {
    setChatRequestId(requestId);
    setChatLoading(true);
    setChatMessages([]);
    try {
      const res = await fetch(`/api/buddy/${requestId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data.messages ?? []);
      }
    } catch { /* ignore */ }
    setChatLoading(false);

    // Start polling for new messages
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    chatPollRef.current = setInterval(async () => {
      try {
        const msgs = [...(document.querySelectorAll('[data-msg-id]'))];
        const lastId = msgs[msgs.length - 1]?.getAttribute('data-msg-time') ?? '';
        const res = await fetch(`/api/buddy/${requestId}/chat${lastId ? `?after=${encodeURIComponent(lastId)}` : ''}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages?.length) {
            setChatMessages((prev) => {
              const ids = new Set(prev.map((m) => m.id));
              const newMsgs = data.messages.filter((m: ChatMessage) => !ids.has(m.id));
              return [...prev, ...newMsgs];
            });
          }
        }
      } catch { /* ignore */ }
    }, 5000);
  }, []);

  const closeChat = () => {
    setChatRequestId(null);
    setChatMessages([]);
    setChatInput('');
    if (chatPollRef.current) clearInterval(chatPollRef.current);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !chatRequestId) return;
    const content = chatInput.trim();
    setChatInput('');
    try {
      const res = await fetch(`/api/buddy/${chatRequestId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, data.message]);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => { if (chatPollRef.current) clearInterval(chatPollRef.current); };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <PublicHeader />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 pt-16 pb-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] text-center leading-[1.1]">
          {t.buddy.title}{' '}
          <span className="text-[var(--accent)]">{t.buddy.titleAccent}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-base leading-relaxed text-[var(--text-secondary)]">
          {t.buddy.subtitle}
        </p>
      </section>

      {/* Tabs */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('browse')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              tab === 'browse'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-accent)]'
            }`}
          >
            <Users className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            {t.buddy.browseRequests}
          </button>
          <button
            onClick={() => setTab('create')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              tab === 'create'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-accent)]'
            }`}
          >
            <UserPlus className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            {t.buddy.createRequest}
          </button>
        </div>

        {/* ───── BROWSE TAB ───── */}
        {tab === 'browse' && (
          <div className="space-y-4 pb-20">
            {/* City filter */}
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
              <select
                value={browseCity}
                onChange={(e) => setBrowseCity(e.target.value)}
                className="bg-transparent text-sm font-medium text-[var(--text-secondary)] border-none focus:outline-none cursor-pointer"
              >
                <option value="">All cities</option>
                {DUTCH_CITIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {browsLoading ? (
              <div className="flex items-center justify-center gap-2 py-12 text-sm text-[var(--text-muted)]">
                <Film className="h-4 w-4 animate-spin" />
                {t.common.loading}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-12">
                <Film className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-muted)]">{t.buddy.noRequests}</p>
              </div>
            ) : (
              requests.map((req) => {
                const spotsUsed = req.interests.length;
                const spotsTotal = req.maxBuddies;
                const isFull = spotsUsed >= spotsTotal;
                const isCreator = userId === req.creator.id;
                const isInterested = req.interests.some((i) => i.userId === userId);
                const canChat = isCreator || isInterested;
                const interestCount = spotsUsed;

                return (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-4 transition-all hover:shadow-sm"
                  >
                    <div className="flex gap-3">
                      {req.posterUrl ? (
                        <Image
                          src={req.posterUrl}
                          alt={req.filmTitle}
                          width={60}
                          height={90}
                          className="rounded-lg object-cover shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-[90px] w-[60px] items-center justify-center rounded-lg bg-[var(--bg-accent)] shrink-0 p-1">
                          <Film className="h-5 w-5 text-[var(--text-muted)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[var(--text-primary)] text-sm truncate">{req.filmTitle}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(req.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {req.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {req.cinemaName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-[var(--text-muted)]">
                            {req.creator.name}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">·</span>
                          <span className={`text-xs font-medium ${isFull ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`}>
                            {spotsUsed}/{spotsTotal} {t.buddy.spots}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {req.ticketUrl && (
                          <a
                            href={req.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-[var(--border-default)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                          >
                            <Ticket className="inline h-3 w-3 mr-1" />
                            Tickets
                          </a>
                        )}
                        {userId && !isCreator && !isInterested && !isFull && (
                          <button
                            onClick={() => handleJoin(req.id)}
                            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98]"
                          >
                            {t.buddy.joinRequest}
                          </button>
                        )}
                        {userId && isInterested && !isCreator && (
                          <button
                            onClick={() => handleLeave(req.id)}
                            className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors"
                          >
                            {t.buddy.leaveRequest}
                          </button>
                        )}
                        {isFull && !isCreator && !isInterested && (
                          <span className="rounded-lg bg-[var(--bg-accent)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
                            {t.buddy.full}
                          </span>
                        )}
                        {canChat && interestCount > 0 && (
                          <button
                            onClick={() => openChat(req.id)}
                            className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-soft)] transition-colors"
                          >
                            <MessageCircle className="inline h-3 w-3 mr-1" />
                            {interestCount > 1 ? t.buddy.groupChat : t.buddy.chat}
                          </button>
                        )}
                        {!userId && (
                          <Link
                            href="/login"
                            className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors"
                          >
                            {t.buddy.joinRequest}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ───── CREATE TAB ───── */}
        {tab === 'create' && (
          <div className="space-y-5 pb-20">
            {!userId ? (
              <div className="text-center py-12">
                <UserPlus className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-sm text-[var(--text-muted)] mb-4">{t.buddy.loginToCreate}</p>
                <Link
                  href="/login"
                  className="inline-flex rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors"
                >
                  {t.common.login}
                </Link>
              </div>
            ) : (
              <>
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    <Calendar className="inline h-4 w-4 mr-1.5 text-[var(--accent)]" />
                    {t.buddy.selectDate}
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {availableDates.slice(0, 14).map((d) => (
                      <button
                        key={d}
                        onClick={() => setFormDate(d)}
                        className={`shrink-0 rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                          formDate === d
                            ? 'bg-[var(--accent)] text-white'
                            : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-accent)]'
                        }`}
                      >
                        {formatDate(d)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                    <MapPin className="inline h-4 w-4 mr-1.5 text-[var(--accent)]" />
                    {t.buddy.selectCity}
                  </label>
                  <select
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {DUTCH_CITIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Film selection */}
                {formLoading ? (
                  <div className="flex items-center gap-2 py-8 text-sm text-[var(--text-muted)] justify-center">
                    <Film className="h-4 w-4 animate-spin" />
                    {t.buddy.loadingScreenings}
                  </div>
                ) : formFilms.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] text-center py-8">{t.buddy.noScreenings}</p>
                ) : (
                  <>
                    {/* Film */}
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                        <Film className="inline h-4 w-4 mr-1.5 text-[var(--accent)]" />
                        {t.buddy.selectFilm}
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[300px] overflow-y-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-2">
                        {formFilms.map((film) => (
                          <button
                            key={film.title}
                            onClick={() => { setFormSelectedFilm(film); setFormSelectedShow(null); }}
                            className={`relative rounded-lg overflow-hidden transition-all ${
                              formSelectedFilm?.title === film.title
                                ? 'ring-2 ring-[var(--accent)] scale-[1.02]'
                                : 'hover:scale-[1.03] opacity-80 hover:opacity-100'
                            }`}
                          >
                            {film.posterUrl ? (
                              <Image
                                src={film.posterUrl}
                                alt={film.title}
                                width={100}
                                height={150}
                                className="rounded-lg object-cover w-full"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-[150px] items-center justify-center rounded-lg bg-[var(--bg-accent)] p-1 text-center">
                                <span className="text-[10px] text-[var(--text-muted)]">{film.title}</span>
                              </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                              <p className="text-[10px] text-white font-medium truncate">{film.title}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Showtime selection */}
                    {formSelectedFilm && (
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                          <Clock className="inline h-4 w-4 mr-1.5 text-[var(--accent)]" />
                          {t.buddy.selectShow}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {filteredShows
                            .sort((a, b) => a.time.localeCompare(b.time))
                            .map((show, i) => (
                              <button
                                key={i}
                                onClick={() => setFormSelectedShow(show)}
                                className={`rounded-lg px-3 py-2 text-xs transition-colors ${
                                  formSelectedShow === show
                                    ? 'bg-[var(--accent)] text-white'
                                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-accent)]'
                                }`}
                              >
                                <span className="font-medium">{show.time}</span>
                                <span className="text-[var(--text-muted)] mx-1">·</span>
                                <span>{show.cinema}</span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Max buddies */}
                    {formSelectedShow && (
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                          <Users className="inline h-4 w-4 mr-1.5 text-[var(--accent)]" />
                          {t.buddy.maxBuddies}
                        </label>
                        <p className="text-xs text-[var(--text-muted)] mb-2">{t.buddy.maxBuddiesHint}</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setFormMaxBuddies(n)}
                              className={`h-10 w-10 rounded-xl text-sm font-semibold transition-colors ${
                                formMaxBuddies === n
                                  ? 'bg-[var(--accent)] text-white'
                                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-accent)]'
                              }`}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Submit */}
                    {formSelectedShow && (
                      <button
                        onClick={handleCreate}
                        disabled={formPosting}
                        className="w-full rounded-xl bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] transition-colors active:scale-[0.98] disabled:opacity-60"
                      >
                        {formPosting ? (
                          <><Film className="inline h-4 w-4 mr-1.5 animate-spin" />{t.buddy.posting}</>
                        ) : formSuccess ? (
                          '✓'
                        ) : (
                          <><Ticket className="inline h-4 w-4 mr-1.5" />{t.buddy.post}</>
                        )}
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ───── CHAT MODAL ───── */}
      {chatRequestId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[var(--bg-primary)] rounded-t-2xl sm:rounded-2xl border border-[var(--border-default)] shadow-xl max-h-[80vh] flex flex-col">
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {requests.find((r) => r.id === chatRequestId)?.filmTitle ?? t.buddy.chat}
                </span>
              </div>
              <button onClick={closeChat} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
              {chatLoading ? (
                <div className="flex justify-center py-8">
                  <Film className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
                </div>
              ) : chatMessages.length === 0 ? (
                <p className="text-center text-sm text-[var(--text-muted)] py-8">
                  {t.buddy.startChat}
                </p>
              ) : (
                chatMessages.map((msg) => {
                  const isOwn = msg.sender.id === userId;
                  return (
                    <div
                      key={msg.id}
                      data-msg-id={msg.id}
                      data-msg-time={msg.createdAt}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${
                        isOwn
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)]'
                      }`}>
                        {!isOwn && (
                          <p className="text-[10px] font-medium mb-0.5 opacity-70">{msg.sender.name}</p>
                        )}
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-[10px] mt-0.5 ${isOwn ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-NL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[var(--border-default)]">
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={t.buddy.typeMessage}
                  className="flex-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  maxLength={2000}
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim()}
                  className="rounded-xl bg-[var(--accent)] px-3 py-2 text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </main>
  );
}
