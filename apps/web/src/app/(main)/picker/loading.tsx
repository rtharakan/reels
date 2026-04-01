export default function PickerLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-48 bg-[var(--bg-accent)] rounded" />
        <div className="h-4 w-64 bg-[var(--bg-accent)] rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 bg-[var(--bg-accent)] rounded-xl" />
        <div className="h-40 bg-[var(--bg-accent)] rounded-xl" />
      </div>
      <div className="mt-8 space-y-3">
        <div className="h-5 w-32 bg-[var(--bg-accent)] rounded" />
        <div className="h-16 bg-[var(--bg-accent)] rounded-lg" />
        <div className="h-16 bg-[var(--bg-accent)] rounded-lg" />
      </div>
    </div>
  );
}
