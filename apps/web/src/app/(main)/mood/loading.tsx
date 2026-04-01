export default function MoodLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-6 w-32 bg-[var(--bg-accent)] rounded-full" />
        <div className="h-8 w-48 bg-[var(--bg-accent)] rounded" />
        <div className="h-4 w-72 bg-[var(--bg-accent)] rounded" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-[88px] bg-[var(--bg-accent)] rounded-xl" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 bg-[var(--bg-accent)] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
