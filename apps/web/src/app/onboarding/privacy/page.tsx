'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivacyConsentPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-300 max-h-64 overflow-y-auto">
        <h3 className="font-semibold text-white mb-2">What data we collect</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>Email address (for authentication)</li>
          <li>Profile information you provide (name, age, location, bio)</li>
          <li>Your public Letterboxd watchlist (film titles only, when you import)</li>
          <li>Usage data (discover interactions, matches)</li>
        </ul>
        <h3 className="font-semibold text-white mt-4 mb-2">How we use it</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>To match you with people who share your film taste</li>
          <li>To display your profile to potential matches</li>
          <li>To improve the matching algorithm</li>
        </ul>
        <h3 className="font-semibold text-white mt-4 mb-2">Your rights</h3>
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
          className="mt-0.5 h-5 w-5 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
          aria-label="I agree to the privacy policy"
        />
        <span className="text-sm text-zinc-300">
          I have read and agree to the privacy policy. I consent to Reels collecting and processing
          my data as described above.
        </span>
      </label>

      <button
        onClick={() => router.push('/onboarding/profile')}
        disabled={!agreed}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );
}
