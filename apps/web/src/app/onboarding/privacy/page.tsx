'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyConsentPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Privacy Policy</h1>
      <div className="rounded-lg border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-sm text-[var(--text-secondary)] max-h-64 overflow-y-auto">
        <h3 className="font-semibold text-[var(--text-primary)] mb-2">What data we collect</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>Email address (for authentication)</li>
          <li>Profile information you provide (name, age, location, bio)</li>
          <li>Your public Letterboxd watchlist (film titles only, when you import)</li>
          <li>Usage data (discover interactions, matches)</li>
        </ul>
        <h3 className="font-semibold text-[var(--text-primary)] mt-4 mb-2">How we use it</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>To match you with people who share your film taste</li>
          <li>To display your profile to potential matches</li>
          <li>To improve the matching algorithm</li>
        </ul>
        <h3 className="font-semibold text-[var(--text-primary)] mt-4 mb-2">Your rights</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>Delete your account and all data at any time</li>
          <li>Export your data in JSON format</li>
          <li>We never sell your data to third parties</li>
        </ul>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-slate-200 bg-blue-50 dark:bg-slate-700 text-[var(--text-primary)] focus:ring-blue-300"
          aria-label="I agree to the privacy policy"
        />
        <span className="text-sm text-[var(--text-secondary)]">
          I have read and agree to the privacy policy. I consent to Reels collecting and processing
          my data as described above.
        </span>
      </label>

      <button
        onClick={() => router.push('/onboarding/profile')}
        disabled={!agreed}
        className="w-full rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
