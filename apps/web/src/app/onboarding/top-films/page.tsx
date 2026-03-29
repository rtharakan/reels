'use client';

import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export default function TopFilmsPage() {
  const router = useRouter();

  const completeMutation = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => {
      sessionStorage.removeItem('onboarding-profile');
      sessionStorage.removeItem('import-result');
      router.push('/discover');
    },
    onError: (err) => {
      console.error('Onboarding error:', err);
    },
  });

  const handleComplete = () => {
    const profileData = JSON.parse(sessionStorage.getItem('onboarding-profile') ?? '{}');

    completeMutation.mutate({
      name: profileData.name ?? '',
      age: profileData.age ?? 17,
      location: profileData.location ?? '',
      bio: profileData.bio ?? '',
      intent: profileData.intent ?? 'BOTH',
      letterboxdUsername: profileData.letterboxdUsername,
      prompts: profileData.prompts ?? [{ question: "What's your favorite film?", answer: 'N/A' }],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Almost done!</h1>
      <p className="text-slate-500 text-sm">
        Your profile is ready. You can select your top films later from your profile page.
      </p>

      <div className="rounded-lg border border-emerald-100 bg-white p-4 text-center">
        <p className="text-lg font-semibold text-stone-800">Welcome to Reels! 🎬</p>
        <p className="mt-2 text-sm text-slate-500">
          Start discovering people who share your film taste.
        </p>
      </div>

      <button
        onClick={handleComplete}
        disabled={completeMutation.isPending}
        className="w-full rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
      >
        {completeMutation.isPending ? 'Setting up...' : 'Start discovering'}
      </button>
    </div>
  );
}
