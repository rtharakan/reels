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
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Almost done!</h1>
      <p className="text-[var(--text-secondary)] text-sm">
        Your profile is ready. You can select your top films later from your profile page.
      </p>

      <div className="rounded-lg border border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 text-center">
        <p className="text-lg font-semibold text-[var(--text-primary)]">Welcome to Reels! 🎬</p>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Start discovering people who share your film taste.
        </p>
      </div>

      <button
        onClick={handleComplete}
        disabled={completeMutation.isPending}
        className="w-full rounded-lg bg-blue-600 dark:bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-50"
      >
        {completeMutation.isPending ? 'Setting up...' : 'Start discovering'}
      </button>
    </div>
  );
}
