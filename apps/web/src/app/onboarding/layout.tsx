export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        <h2 className="mb-2 text-center text-xl font-bold text-stone-800">Reels</h2>
        <div className="mb-8 flex justify-center gap-2">
          <div className="h-1 w-12 rounded bg-teal-400" />
          <div className="h-1 w-12 rounded bg-teal-100" />
          <div className="h-1 w-12 rounded bg-teal-100" />
          <div className="h-1 w-12 rounded bg-teal-100" />
        </div>
        {children}
      </div>
    </div>
  );
}
