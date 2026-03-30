import React from 'react';
import { clsx } from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
        {
          'bg-[var(--accent,#D4856A)] text-white hover:bg-[var(--accent-hover,#C2714E)] focus-visible:ring-[var(--ring,#E8927C)]':
            variant === 'primary',
          'bg-[var(--bg-accent,#F5F5F4)] text-[var(--text-secondary,#57534E)] hover:bg-[var(--border-default,#E7E5E4)] focus-visible:ring-[var(--ring,#E8927C)]':
            variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500':
            variant === 'danger',
          'text-[var(--text-muted,#78716C)] hover:bg-[var(--bg-accent,#F5F5F4)] hover:text-[var(--text-primary,#1C1917)] focus-visible:ring-[var(--ring,#E8927C)]':
            variant === 'ghost',
        },
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
