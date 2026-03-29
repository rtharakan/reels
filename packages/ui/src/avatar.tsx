import React from 'react';
import { clsx } from 'clsx';

type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function Avatar({ src, alt, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20',
  };

  return src ? (
    <img
      src={src}
      alt={alt}
      className={clsx('rounded-full object-cover', sizeClasses[size], className)}
    />
  ) : (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full bg-teal-100 text-stone-500',
        sizeClasses[size],
        className,
      )}
      role="img"
      aria-label={alt}
    >
      {alt.charAt(0).toUpperCase()}
    </div>
  );
}
