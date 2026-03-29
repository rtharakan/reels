export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h2 className="mb-2 text-center text-xl font-bold text-white">Reels</h2>
        <div className="mb-8 flex justify-center gap-2">
          <div className="h-1 w-12 rounded bg-zinc-100" />
          <div className="h-1 w-12 rounded bg-zinc-700" />
          <div className="h-1 w-12 rounded bg-zinc-700" />
          <div className="h-1 w-12 rounded bg-zinc-700" />
        </div>
        {children}
      </div>
    </div>
  );
}
