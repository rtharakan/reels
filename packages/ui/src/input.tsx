import React from 'react';
import { clsx } from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-secondary,#57534E)]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'block w-full rounded-xl border bg-[var(--bg-card,#FFFFFF)] px-3 py-2 text-[var(--text-primary,#1C1917)] placeholder-[var(--text-muted,#78716C)] focus:outline-none focus:ring-2 focus:ring-[var(--ring,#E8927C)] transition-colors',
          error ? 'border-red-500' : 'border-[var(--border-default,#E7E5E4)]',
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
