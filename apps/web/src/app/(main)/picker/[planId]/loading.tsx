export default function PlanDetailLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-pulse">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-9 w-9 bg-[var(--bg-accent)] rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-40 bg-[var(--bg-accent)] rounded" />
          <div className="h-3 w-16 bg-[var(--bg-accent)] rounded" />
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <div className="h-[120px] w-[80px] bg-[var(--bg-accent)] rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-[var(--bg-accent)] rounded" />
          <div className="h-3 w-48 bg-[var(--bg-accent)] rounded" />
          <div className="flex gap-1 mt-2">
            <div className="h-5 w-16 bg-[var(--bg-accent)] rounded-full" />
            <div className="h-5 w-16 bg-[var(--bg-accent)] rounded-full" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 bg-[var(--bg-accent)] rounded-lg" />
        ))}
      </div>
    </div>
  );
}
