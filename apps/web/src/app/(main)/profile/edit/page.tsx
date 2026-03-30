'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function EditProfilePage() {
  const router = useRouter();
  const { data: user } = trpc.user.me.useQuery();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [intent, setIntent] = useState<'FRIENDS' | 'DATING' | 'BOTH'>('BOTH');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setAge(String(user.age));
      setLocation(user.location);
      setBio(user.bio ?? '');
      setIntent(user.intent as 'FRIENDS' | 'DATING' | 'BOTH');
    }
  }, [user]);

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => router.push('/profile'),
  });

  const handleSave = () => {
    updateMutation.mutate({
      name,
      age: parseInt(age, 10),
      location,
      bio,
      intent,
    });
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-6">
      <h1 className="mb-6 text-lg font-semibold text-[var(--text-primary)]">Edit Profile</h1>

      <div className="space-y-4">
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-[var(--text-secondary)]">Name</label>
          <input id="edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={50}
            className="mt-1 block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2.5 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-ring)] focus:outline-none transition-colors" />
        </div>
        <div>
          <label htmlFor="edit-age" className="block text-sm font-medium text-[var(--text-secondary)]">Age</label>
          <input id="edit-age" type="number" min={17} value={age} onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2.5 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-ring)] focus:outline-none transition-colors" />
        </div>
        <div>
          <label htmlFor="edit-location" className="block text-sm font-medium text-[var(--text-secondary)]">Location</label>
          <input id="edit-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100}
            className="mt-1 block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2.5 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-ring)] focus:outline-none transition-colors" />
        </div>
        <div>
          <label htmlFor="edit-bio" className="block text-sm font-medium text-[var(--text-secondary)]">Bio</label>
          <textarea id="edit-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500}
            className="mt-1 block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-2.5 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent-ring)] focus:outline-none resize-none transition-colors" />
        </div>
        <fieldset>
          <legend className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Looking for</legend>
          <div className="flex gap-2">
            {(['FRIENDS', 'DATING', 'BOTH'] as const).map((option) => (
              <button key={option} onClick={() => setIntent(option)} type="button"
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  intent === option ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-accent)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}>
                {option === 'FRIENDS' ? 'Friends' : option === 'DATING' ? 'Dating' : 'Both'}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3 pt-4">
          <button onClick={() => router.back()} className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={updateMutation.isPending}
            className="flex-1 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-colors active:scale-[0.98]">
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
