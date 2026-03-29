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
      <h1 className="text-2xl font-bold text-stone-800">Import your watchlist</h1>
      <p className="text-slate-500 text-sm">
        Connect your Letterboxd account to import your watchlist. This is how we find your film
        matches.
      </p>

      <div>
        <label htmlFor="letterboxd-username" className="block text-sm font-medium text-stone-500">
          Letterboxd username
        </label>
        <input
          id="letterboxd-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your-username"
          className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-stone-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-300 focus:outline-none"
        />
        {error && <p className="mt-2 text-sm text-red-400" role="alert">{error}</p>}
      </div>

      {importMutation.isPending && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-400 border-t-transparent" />
          Importing your watchlist...
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleImport}
          disabled={importMutation.isPending}
          className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          Import watchlist
        </button>
        <button
          onClick={handleSkip}
          className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-stone-500 hover:bg-emerald-50"
        >
          Skip for now
        </button>
      </div>

      <p className="text-xs text-slate-400">
        We only access your public watchlist. Your Letterboxd profile must be public for the import
        to work.
      </p>
    </div>
  );
}
