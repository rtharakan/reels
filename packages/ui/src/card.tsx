import React from 'react';
import { clsx } from 'clsx';

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx('rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg', className)}
      {...props}
    >
      {children}
    </div>
  );
}
