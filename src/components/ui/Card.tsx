import { type HTMLAttributes } from 'react';

import { cn } from '@utils/cn';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-surface', className)}
      {...props}
    >
      {children}
    </div>
  );
}
