'use client';

interface DeleteAccountDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function DeleteAccountDialog({ onConfirm, onCancel, isPending }: DeleteAccountDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-soft-lg">
        <h2 id="delete-title" className="text-lg font-semibold text-[var(--text-primary)]">Delete your account?</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          This will permanently delete your profile, watchlist, matches, and all data.
          This action cannot be undone.
        </p>
        <p className="mt-3 text-sm font-medium text-red-500">
          All your data will be removed within 30 days.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Deleting...' : 'Delete forever'}
          </button>
        </div>
      </div>
    </div>
  );
}
