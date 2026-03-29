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
      <h1 className="mb-6 text-xl font-bold text-stone-800">Edit Profile</h1>

      <div className="space-y-4">
        <div>
          <label htmlFor="edit-name" className="block text-sm font-medium text-stone-500">Name</label>
          <input id="edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)} maxLength={50}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-stone-800 focus:ring-2 focus:ring-teal-300 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="edit-age" className="block text-sm font-medium text-stone-500">Age</label>
          <input id="edit-age" type="number" min={17} value={age} onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-stone-800 focus:ring-2 focus:ring-teal-300 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="edit-location" className="block text-sm font-medium text-stone-500">Location</label>
          <input id="edit-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} maxLength={100}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-stone-800 focus:ring-2 focus:ring-teal-300 focus:outline-none" />
        </div>
        <div>
          <label htmlFor="edit-bio" className="block text-sm font-medium text-stone-500">Bio</label>
          <textarea id="edit-bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500}
            className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-stone-800 focus:ring-2 focus:ring-teal-300 focus:outline-none resize-none" />
        </div>
        <fieldset>
          <legend className="block text-sm font-medium text-stone-500 mb-2">Looking for</legend>
          <div className="flex gap-2">
            {(['FRIENDS', 'DATING', 'BOTH'] as const).map((option) => (
              <button key={option} onClick={() => setIntent(option)} type="button"
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  intent === option ? 'bg-teal-600 text-white' : 'bg-emerald-50 text-slate-500 hover:text-stone-800'
                }`}>
                {option === 'FRIENDS' ? 'Friends' : option === 'DATING' ? 'Dating' : 'Both'}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-3 pt-4">
          <button onClick={() => router.back()} className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-stone-500 hover:bg-emerald-50">
            Cancel
          </button>
          <button onClick={handleSave} disabled={updateMutation.isPending}
            className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
