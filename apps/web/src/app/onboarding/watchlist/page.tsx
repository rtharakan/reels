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
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Import your watchlist</h1>
      <p className="text-[var(--text-secondary)] text-sm">
        Connect your Letterboxd account to import your watchlist. This is how we find your film
        matches.
      </p>

      <div>
        <label htmlFor="letterboxd-username" className="block text-sm font-medium text-[var(--text-secondary)]">
          Letterboxd username
        </label>
        <input
          id="letterboxd-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your-username"
          className="mt-1 block w-full rounded-lg border border-slate-200 bg-blue-50 dark:bg-slate-700 px-3 py-2 text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-red-400" role="alert">{error}</p>}
      </div>

      {importMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          Importing your watchlist...
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleImport}
          disabled={importMutation.isPending}
          className="w-full rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50"
        >
          Import watchlist
        </button>
        <button
          onClick={handleSkip}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-blue-50 dark:bg-slate-700"
        >
          Skip for now
        </button>
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        We only access your public watchlist. Your Letterboxd profile must be public for the import
        to work.
      </p>
    </div>
  );
}
