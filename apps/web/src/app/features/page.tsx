'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Lightbulb,
  ChevronUp,
  Film,
  Heart,
  Search,
  Shield,
  Popcorn,
  Plus,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Star,
} from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/components/public-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  votes: number;
  status: 'considering' | 'planned' | 'in-progress' | 'shipped';
  hasVoted?: boolean;
}

const INITIAL_REQUESTS: FeatureRequest[] = [
  {
    id: '1',
    title: 'Director-based matching',
    description:
      "Match with cinephiles who share your favorite directors — not just films. If you're both obsessed with Agnès Varda, that says a lot.",
    category: 'Matching',
    votes: 142,
    status: 'planned',
  },
  {
    id: '2',
    title: 'Annual Top 10 comparison',
    description:
      "Compare your year-end top 10 lists with another cinephile's. Great for finding people with deeply aligned taste.",
    category: 'Matching',
    votes: 98,
    status: 'considering',
  },
  {
    id: '3',
    title: 'Cinema check-in — mark as going',
    description:
      "Tell others you're going to a specific screening. See who else is attending the same film at the same cinema.",
    category: 'Social',
    votes: 87,
    status: 'planned',
  },
  {
    id: '4',
    title: 'Film recommendations from matches',
    description:
      "Once matched, suggest films to each other with personal notes. Like a tiny private Letterboxd between two people.",
    category: 'Social',
    votes: 76,
    status: 'in-progress',
  },
  {
    id: '5',
    title: 'Decade taste filter',
    description:
      "Filter your Discover feed by cinephiles who love a particular era — 70s New Hollywood, 80s Hong Kong cinema, 90s European art house...",
    category: 'Discover',
    votes: 63,
    status: 'considering',
  },
  {
    id: '6',
    title: 'Shared review highlights',
    description:
      "Show excerpts from each other's Letterboxd reviews on shared films. Reading how someone writes about a film you love tells you everything.",
    category: 'Matching',
    votes: 59,
    status: 'considering',
  },
  {
    id: '7',
    title: 'Android app',
    description: 'A native Android app with feature parity to iOS and the web app.',
    category: 'Platform',
    votes: 211,
    status: 'in-progress',
  },
];

const STATUS_CONFIG: Record<FeatureRequest['status'], { label: string; color: string }> = {
  considering: { label: 'Considering', color: 'text-[var(--text-muted)] bg-[var(--bg-accent)]' },
  planned: { label: 'Planned', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40' },
  'in-progress': { label: 'In progress', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' },
  shipped: { label: 'Shipped ✓', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40' },
};

const CATEGORIES = ['All', 'Matching', 'Discover', 'Social', 'Platform', 'Privacy', 'Other'];

function FeatureCard({ request, onVote }: { request: FeatureRequest; onVote: (id: string) => void }) {
  const status = STATUS_CONFIG[request.status];
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-sm">
      <div className="flex items-stretch">
        {/* Vote column */}
        <button
          type="button"
          onClick={() => onVote(request.id)}
          aria-label={`Upvote: ${request.title}`}
          className={`flex flex-col items-center justify-center gap-1 border-r border-[var(--border-default)] px-4 py-4 text-center transition-colors min-w-[60px] ${
            request.hasVoted
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:bg-[var(--bg-accent)] hover:text-[var(--text-secondary)]'
          }`}
        >
          <ChevronUp className="h-5 w-5" />
          <span className="text-sm font-semibold">{request.votes + (request.hasVoted ? 0 : 0)}</span>
        </button>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">{request.title}</h3>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">{request.description}</p>
          <div className="mt-2">
            <Badge variant="secondary" className="text-[10px]">{request.category}</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function FeaturesPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>(INITIAL_REQUESTS);
  const [filter, setFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Other');
  const [formError, setFormError] = useState<string | null>(null);

  const handleVote = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, hasVoted: !r.hasVoted, votes: r.votes + (r.hasVoted ? -1 : 1) }
          : r,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please give your feature request a title.');
      return;
    }
    if (formTitle.trim().length < 10) {
      setFormError('Make it a bit more descriptive — at least 10 characters.');
      return;
    }
    setFormError(null);
    // In production this would POST to an API endpoint.
    // For now we add to local state so the user gets immediate feedback.
    const newRequest: FeatureRequest = {
      id: String(Date.now()),
      title: formTitle.trim(),
      description: formDesc.trim() || 'No description provided.',
      category: formCategory,
      votes: 1,
      status: 'considering',
      hasVoted: true,
    };
    setRequests((prev) => [newRequest, ...prev]);
    setSubmitted(true);
    setFormTitle('');
    setFormDesc('');
  };

  const filtered =
    filter === 'All' ? requests : requests.filter((r) => r.category === filter);

  const sorted = [...filtered].sort((a, b) => b.votes - a.votes);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <PublicHeader />

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] border border-[var(--border-default)]">
            <Lightbulb className="h-8 w-8 text-[var(--accent)]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Feature <span className="text-[var(--accent)]">Requests</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-[var(--text-secondary)]">
            This is your product too. Vote on features you'd love to see, or add your own. The ideas with the most love from the community shape what we build next.
          </p>
        </div>

        {/* Filter + Submit */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  filter === cat
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => { setShowForm((f) => !f); setSubmitted(false); }} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Suggest a feature
          </Button>
        </div>

        {/* Submission form */}
        {showForm && !submitted && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                Your idea
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="feat-title">What would you like to see?</Label>
                  <Input
                    id="feat-title"
                    placeholder="e.g. Director-based matching"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    maxLength={120}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="feat-desc">Tell us more (optional)</Label>
                  <textarea
                    id="feat-desc"
                    rows={3}
                    placeholder="Describe what it would do and why it matters to you as a cinephile..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    maxLength={600}
                    className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="feat-cat">Category</Label>
                  <select
                    id="feat-cat"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                {formError && (
                  <p className="text-sm text-red-500">{formError}</p>
                )}
                <div className="flex gap-3">
                  <Button type="submit" className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    Submit idea
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {showForm && submitted && (
          <div className="mb-8 rounded-2xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 p-6 text-center">
            <Star className="mx-auto mb-2 h-8 w-8 text-green-500" />
            <p className="font-medium text-[var(--text-primary)]">Thank you — your idea is in the mix.</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">We read every single one. The best ideas from the community shape the roadmap.</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setShowForm(false); setSubmitted(false); }}>
              Suggest another
            </Button>
          </div>
        )}

        {/* Feature list */}
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] text-sm">
              No requests in this category yet. Be the first!
            </div>
          ) : (
            sorted.map((req) => (
              <FeatureCard key={req.id} request={req} onVote={handleVote} />
            ))
          )}
        </div>

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-[var(--text-muted)]">
          Votes influence the roadmap but don&apos;t guarantee shipping order.
          Some features involve complexity that isn&apos;t obvious from the outside.{' '}
          <Link href="/help" className="underline hover:text-[var(--text-secondary)]">
            Have a question?
          </Link>
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
