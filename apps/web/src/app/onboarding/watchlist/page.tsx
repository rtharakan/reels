'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function WatchlistImportPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const importMutation = trpc.watchlist.import.useMutation({
    onSuccess: (data) => {
      sessionStorage.setItem('import-result', JSON.stringify(data));
      router.push('/onboarding/top-films');
    },
    onError: (err) => {
      if (err.message.includes('private')) {
        setError('This profile is private — please make it public on Letterboxd and try again.');
      } else if (err.message.includes('not found') || err.message.includes('Username')) {
        setError('Username not found. Please check and try again.');
      } else {
        setError('Failed to import watchlist. Please try again.');
      }
    },
  });

  const handleImport = () => {
    if (!username.trim()) {
      setError('Please enter your Letterboxd username');
      return;
    }
    setError('');
    importMutation.mutate({ letterboxdUsername: username.trim() });
  };

  const handleSkip = () => {
    sessionStorage.setItem('import-result', JSON.stringify(null));
    router.push('/onboarding/top-films');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Import your watchlist</h1>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
        Connect your Letterboxd to find your film matches.
      </p>

      <div>
        <label htmlFor="letterboxd-username" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Letterboxd username
        </label>
        <input
          id="letterboxd-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your-username"
          className="block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none transition-colors"
        />
        {error && <p className="mt-2 text-sm text-red-500" role="alert">{error}</p>}
      </div>

      {importMutation.isPending && (
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          Importing your watchlist...
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleImport}
          disabled={importMutation.isPending}
          className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          Import watchlist
        </button>
        <button
          onClick={handleSkip}
          className="w-full rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors"
        >
          Skip for now
        </button>
      </div>

      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        We only access your public watchlist. Your Letterboxd profile must be public.
      </p>
    </div>
  );
}
