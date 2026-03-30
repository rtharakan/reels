'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Search,
  Loader2,
  ExternalLink,
  Popcorn,
  Radar,
  Users,
  Film,
  Heart,
  Sparkles,
  ChevronRight,
  Zap,
  Clock,
  Target,
} from 'lucide-react';
import { ThemeToggleCompact } from '@/components/theme-toggle';

interface ScanResult {
  username: string;
  displayName: string;
  score: number;
  sharedFilmsCount: number;
  sharedLikedCount: number;
  profileUrl: string;
  label: string;
}

interface ScanResponse {
  username: string;
  results: ScanResult[];
  totalFound: number;
  depth: string;
  error?: string;
  code?: string;
}

function getLabelColor(label: string): string {
  switch (label) {
    case 'Soul Mates':
      return 'bg-[var(--accent-soft)] text-[var(--accent)]';
    case 'Great Match':
      return 'bg-[var(--accent-soft)] text-[var(--accent)]';
    case 'Good Vibes':
      return 'bg-[var(--bg-accent)] text-[var(--text-secondary)]';
    case 'Film Friends':
      return 'bg-[var(--bg-accent)] text-[var(--text-muted)]';
    default:
      return 'bg-[var(--bg-muted)] text-[var(--text-muted)]';
  }
}

export default function ScanPage() {
  const [username, setUsername] = useState('');
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a Letterboxd username.');
      return;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), depth }),
      });

      const data = await response.json();

      if (data.error && !data.results) {
        setError(data.error);
        return;
      }

      setResult(data);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const depthOptions = [
    { value: 'quick' as const, label: 'Quick', icon: Zap, desc: '~30 seconds' },
    { value: 'standard' as const, label: 'Standard', icon: Target, desc: '~2 minutes' },
    { value: 'deep' as const, label: 'Deep', icon: Radar, desc: '~5 minutes' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="border-b border-[var(--border-default)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Popcorn className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-lg font-bold text-[var(--text-primary)]">Reels</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/explore">
              <Button variant="ghost" size="sm">Explore</Button>
            </Link>
            <Link href="/plan">
              <Button variant="ghost" size="sm">Plan</Button>
            </Link>
            <ThemeToggleCompact />
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-default)]">
            <Radar className="h-8 w-8 text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Scan for <span className="text-[var(--accent)]">Film Twins</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-secondary)]">
            Enter your Letterboxd profile and our agent will explore the platform
            to find people with similar film taste — scored using{' '}
            <Link href="/#scoring" className="text-[var(--accent)] hover:underline">
              5-signal matching
            </Link>.
          </p>
        </div>

        {/* Scan Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-500" />
              Find Similar Profiles
            </CardTitle>
            <CardDescription>
              Enter your Letterboxd username or paste your full profile link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Your Letterboxd Profile</Label>
                <Input
                  id="username"
                  placeholder="username or letterboxd.com/username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isScanning}
                />
              </div>

              {/* Scan depth selector */}
              <div className="space-y-2">
                <Label>Scan Depth</Label>
                <div className="grid grid-cols-3 gap-3">
                  {depthOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDepth(opt.value)}
                      disabled={isScanning}
                      className={`rounded-xl border p-3 text-center transition-all ${
                        depth === opt.value
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--ring)]'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <opt.icon className={`mx-auto h-5 w-5 mb-1 ${depth === opt.value ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`} />
                      <p className={`text-sm font-medium ${depth === opt.value ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" disabled={isScanning} className="w-full">
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning Letterboxd...
                  </>
                ) : (
                  <>
                    <Radar className="h-4 w-4" />
                    Start Scan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Scanning indicator */}
        {isScanning && (
          <Card className="mb-8 overflow-hidden">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 via-[var(--accent)]/5 to-transparent animate-pulse" />
              <CardContent className="relative py-8 text-center">
                <Radar className="mx-auto h-10 w-10 text-[var(--accent)] animate-pulse mb-3" />
                <p className="text-lg font-medium text-[var(--text-primary)]">
                  Scanning Letterboxd...
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Exploring film fan pages, fetching profiles, and scoring compatibility.
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-3">
                  This may take a few minutes depending on scan depth.
                </p>
              </CardContent>
            </div>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Scanned for{' '}
                      <a
                        href={`https://letterboxd.com/${result.username}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--accent)] hover:underline"
                      >
                        {result.username}
                      </a>
                    </p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">
                      {result.totalFound} compatible {result.totalFound === 1 ? 'profile' : 'profiles'} found
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {result.depth} scan
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Results list */}
            {result.results.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                  <p className="text-[var(--text-secondary)]">
                    No highly compatible profiles found. Try a deeper scan or make sure your
                    Letterboxd profile has liked/watched films.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {result.results.map((match, index) => (
                  <Card key={match.username} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 p-4">
                      {/* Rank */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-sm shrink-0">
                        #{index + 1}
                      </div>

                      {/* User info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-[var(--text-primary)] truncate">
                            {match.displayName}
                          </p>
                          <Badge className={`text-xs ${getLabelColor(match.label)}`}>
                            {match.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <Film className="h-3 w-3" />
                            {match.sharedFilmsCount} shared
                          </span>
                          {match.sharedLikedCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {match.sharedLikedCount} both liked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-[var(--text-primary)]">
                          {Math.round(match.score * 100)}%
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">match</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={match.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                        <Link href={`/explore?user1=${encodeURIComponent(username)}&user2=${encodeURIComponent(match.username)}`}>
                          <Button size="sm" variant="outline">
                            Compare
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* CTA */}
            <Card className="bg-[var(--bg-card)]">
              <CardContent className="flex flex-col items-center py-8 text-center">
                <Sparkles className="h-8 w-8 text-[var(--accent)] mb-3" />
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  Found someone interesting?
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm">
                  Create a free Reels account to get matched, connect, and plan cinema dates
                  with people who share your film taste.
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

        {/* How it works (when no results) */}
        {!result && !isScanning && (
          <div className="mt-8">
            <h2 className="text-center text-xl font-semibold text-[var(--text-primary)] mb-8">
              How Scan works
            </h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                    <Film className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">Import your taste</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    We read your liked and watched films from Letterboxd
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                    <Radar className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">Discover fans</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Our agent crawls film fan pages to find people who loved the same films
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                    <Users className="h-6 w-6 text-[var(--accent)]" />
                  </div>
                  <h3 className="font-medium text-[var(--text-primary)] mb-1">Score & rank</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Each profile is scored with 5-signal matching and ranked by compatibility
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
