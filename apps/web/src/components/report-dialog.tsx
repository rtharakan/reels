'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

const REPORT_REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'INAPPROPRIATE_CONTENT', label: 'Inappropriate content' },
  { value: 'FAKE_PROFILE', label: 'Fake profile' },
  { value: 'OTHER', label: 'Other' },
] as const;

type ReportReason = typeof REPORT_REASONS[number]['value'];

interface ReportDialogProps {
  targetUserId: string;
  targetUserName: string;
  onClose: () => void;
}

export function ReportDialog({ targetUserId, targetUserName, onClose }: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportMutation = trpc.safety.report.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Report submitted">
        <div className="w-full max-w-sm rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-soft-lg text-center">
          <p className="text-2xl mb-3">✓</p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Report submitted</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Thank you. We&apos;ll review your report and take appropriate action.
          </p>
          <button
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 shadow-soft-lg">
        <h2 id="report-title" className="text-lg font-semibold text-[var(--text-primary)]">
          Report {targetUserName}
        </h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Select a reason for your report.
        </p>

        <fieldset className="mt-4">
          <legend className="sr-only">Report reason</legend>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${
                  reason === r.value
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-[var(--border-default)] hover:bg-[var(--bg-accent)]'
                }`}
              >
                <input
                  type="radio"
                  name="report-reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={() => setReason(r.value)}
                  className="sr-only"
                />
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  reason === r.value ? 'border-[var(--accent)]' : 'border-[var(--text-muted)]'
                }`}>
                  {reason === r.value && <div className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
                </div>
                <span className="text-sm text-[var(--text-primary)]">{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-4">
          <label htmlFor="report-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
            Additional details (optional)
          </label>
          <textarea
            id="report-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
            placeholder="Any additional context..."
            className="block w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--ring)] focus:outline-none resize-none transition-colors"
          />
        </div>

        {reportMutation.error && (
          <p className="mt-3 text-sm text-red-500" role="alert">
            Something went wrong. Please try again.
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-accent)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!reason) return;
              reportMutation.mutate({
                reportedUserId: targetUserId,
                reason,
                description: description.trim() || undefined,
              });
            }}
            disabled={!reason || reportMutation.isPending}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {reportMutation.isPending ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
