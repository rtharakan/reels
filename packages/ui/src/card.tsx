import React from 'react';
import { clsx } from 'clsx';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx('rounded-2xl border border-[var(--border-default,#E7E5E4)] bg-[var(--bg-card,#FFFFFF)] p-4 shadow-[0_1px_3px_0_rgb(0_0_0/0.04)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
