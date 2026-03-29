import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-blue-600 dark:bg-blue-500 text-white',
        secondary: 'border-transparent bg-blue-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200',
        destructive: 'border-transparent bg-red-600 text-white',
        outline: 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400',
        success: 'border-transparent bg-green-700 text-green-100',
        warning: 'border-transparent bg-amber-700 text-amber-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
