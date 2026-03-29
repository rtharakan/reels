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
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-zinc-100 text-zinc-900 hover:bg-white focus-visible:ring-zinc-400':
            variant === 'primary',
          'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 focus-visible:ring-zinc-400':
            variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500':
            variant === 'danger',
          'text-zinc-300 hover:bg-zinc-800 hover:text-white focus-visible:ring-zinc-400':
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
