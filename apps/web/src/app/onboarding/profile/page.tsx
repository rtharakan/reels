'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PROMPTS = [
  "What's a film that changed your perspective?",
  'Which director do you think is underrated?',
  "What film could you watch on repeat and never get bored?",
];

export default function ProfilePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [intent, setIntent] = useState<'FRIENDS' | 'DATING' | 'BOTH'>('BOTH');
  const [prompts, setPrompts] = useState([{ question: PROMPTS[0]!, answer: '' }]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name || name.length > 50) newErrors.name = 'Name is required (1-50 chars)';
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 17) newErrors.age = 'Must be 17 or older';
    if (!location || location.length > 100) newErrors.location = 'Location is required (1-100 chars)';
    if (!bio || bio.length > 500) newErrors.bio = 'Bio is required (1-500 chars)';
    if (prompts.length === 0 || !prompts[0]?.answer) newErrors.prompts = 'At least one prompt answer is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      // Store in sessionStorage for the final submission
      sessionStorage.setItem(
        'onboarding-profile',
        JSON.stringify({ name, age: parseInt(age, 10), location, bio, intent, prompts: prompts.filter((p) => p.answer) }),
      );
      router.push('/onboarding/watchlist');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create your profile</h1>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)]">Display name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={50}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-blue-50 dark:bg-slate-700 px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          {errors.name && <p className="mt-1 text-sm text-red-400" role="alert">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-[var(--text-secondary)]">Age</label>
          <input id="age" type="number" min={17} value={age} onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-blue-50 dark:bg-slate-700 px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          {errors.age && <p className="mt-1 text-sm text-red-400" role="alert">{errors.age}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-[var(--text-secondary)]">Location</label>
          <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} placeholder="City, Country"
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-blue-50 dark:bg-slate-700 px-3 py-2 text-[var(--text-primary)] placeholder-slate-400 focus:ring-2 focus:ring-blue-300 focus:outline-none" />
          {errors.location && <p className="mt-1 text-sm text-red-400" role="alert">{errors.location}</p>}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-[var(--text-secondary)]">Bio</label>
          <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-blue-50 dark:bg-slate-700 px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-300 focus:outline-none resize-none" />
          <p className="mt-1 text-xs text-[var(--text-muted)]">{bio.length}/500</p>
          {errors.bio && <p className="text-sm text-red-400" role="alert">{errors.bio}</p>}
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-[var(--text-secondary)] mb-2">What are you looking for?</legend>
          <div className="flex gap-2">
            {(['FRIENDS', 'DATING', 'BOTH'] as const).map((option) => (
              <button key={option} onClick={() => setIntent(option)} type="button"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  intent === option ? 'bg-blue-600 dark:bg-blue-500 text-white' : 'bg-blue-50 dark:bg-slate-700 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {option === 'FRIENDS' ? 'Friends' : option === 'DATING' ? 'Dating' : 'Both'}
              </button>
            ))}
          </div>
        </fieldset>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Conversation prompt</label>
          {prompts.map((prompt, i) => (
            <div key={i} className="space-y-1 mb-3">
              <p className="text-xs text-[var(--text-muted)]">{prompt.question}</p>
              <input type="text" value={prompt.answer} maxLength={300}
                onChange={(e) => {
                  const updated = [...prompts];
                  updated[i] = { ...prompt, answer: e.target.value };
                  setPrompts(updated);
                }}
                className="block w-full rounded-lg border border-slate-200 bg-blue-50 dark:bg-slate-700 px-3 py-2 text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-blue-300 focus:outline-none"
                aria-label={`Answer for: ${prompt.question}`}
              />
            </div>
          ))}
          {prompts.length < 3 && (
            <button type="button" onClick={() => setPrompts([...prompts, { question: PROMPTS[prompts.length]!, answer: '' }])}
              className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-secondary)]">
              + Add another prompt
            </button>
          )}
          {errors.prompts && <p className="mt-1 text-sm text-red-400" role="alert">{errors.prompts}</p>}
        </div>
      </div>

      <button onClick={handleContinue}
        className="w-full rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-400">
        Continue
      </button>
    </div>
  );
}
