import * as React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-text placeholder:text-[var(--textMuted)] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
Input.displayName = 'Input';

export const TextArea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-text placeholder:text-[var(--textMuted)] shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)] disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-y',
        className
      )}
      {...props}
    />
  );
});
TextArea.displayName = 'TextArea';
