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
      <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Create your profile</h1>

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Display name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={50}
            className="block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none transition-colors" />
          {errors.name && <p className="mt-1 text-sm text-red-500" role="alert">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Age</label>
          <input id="age" type="number" min={17} value={age} onChange={(e) => setAge(e.target.value)}
            className="block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none transition-colors" />
          {errors.age && <p className="mt-1 text-sm text-red-500" role="alert">{errors.age}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Location</label>
          <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100} placeholder="City, Country"
            className="block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none transition-colors" />
          {errors.location && <p className="mt-1 text-sm text-red-500" role="alert">{errors.location}</p>}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Bio</label>
          <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500}
            className="block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none resize-none transition-colors" />
          <p className="mt-1 text-xs text-[var(--text-muted)]">{bio.length}/500</p>
          {errors.bio && <p className="text-sm text-red-500" role="alert">{errors.bio}</p>}
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Looking for</legend>
          <div className="flex gap-2">
            {(['FRIENDS', 'DATING', 'BOTH'] as const).map((option) => (
              <button key={option} onClick={() => setIntent(option)} type="button"
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                  intent === option ? 'bg-[var(--accent)] text-white shadow-soft' : 'bg-[var(--bg-accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                className="block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none transition-colors"
                aria-label={`Answer for: ${prompt.question}`}
              />
            </div>
          ))}
          {prompts.length < 3 && (
            <button type="button" onClick={() => setPrompts([...prompts, { question: PROMPTS[prompts.length]!, answer: '' }])}
              className="text-sm text-[var(--accent)] hover:underline">
              + Add another prompt
            </button>
          )}
          {errors.prompts && <p className="mt-1 text-sm text-red-500" role="alert">{errors.prompts}</p>}
        </div>
      </div>

      <button onClick={handleContinue}
        className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-all active:scale-[0.98]">
        Continue
      </button>
    </div>
  );
}
