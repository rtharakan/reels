export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h2 className="mb-2 text-center text-xl font-bold text-[var(--text-primary)]">Reels</h2>
        <div className="mb-8 flex justify-center gap-2">
          <div className="h-1 w-12 rounded bg-blue-400 dark:bg-blue-500" />
          <div className="h-1 w-12 rounded bg-blue-100 dark:bg-blue-900" />
          <div className="h-1 w-12 rounded bg-blue-100 dark:bg-blue-900" />
          <div className="h-1 w-12 rounded bg-blue-100 dark:bg-blue-900" />
        </div>
        {children}
      </div>
    </div>
  );
}
