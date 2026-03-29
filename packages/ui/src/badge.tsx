import React from 'react';
import { clsx } from 'clsx';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'friends' | 'dating' | 'both';
  className?: string;
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-zinc-700 text-zinc-200': variant === 'default',
          'bg-emerald-900 text-emerald-200': variant === 'friends',
          'bg-pink-900 text-pink-200': variant === 'dating',
          'bg-violet-900 text-violet-200': variant === 'both',
        },
        className,
      )}
    >
      {children}
    </span>
  );
}
