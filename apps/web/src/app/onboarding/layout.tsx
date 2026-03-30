export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h2 className="mb-2 text-center text-xl font-semibold tracking-tight text-[var(--text-primary)]">Reels</h2>
        <div className="mb-8 flex justify-center gap-2">
          <div className="h-1 w-12 rounded-full bg-[var(--accent)]" />
          <div className="h-1 w-12 rounded-full bg-[var(--border-default)]" />
          <div className="h-1 w-12 rounded-full bg-[var(--border-default)]" />
          <div className="h-1 w-12 rounded-full bg-[var(--border-default)]" />
        </div>
        {children}
      </div>
    </div>
  );
}
