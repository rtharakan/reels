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
        'bg-teal-100 text-stone-600',
        className,
      )}
    >
      {children}
    </span>
  );
}
