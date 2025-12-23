import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius)-4px)] border border-transparent font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)] disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--blue)] text-[var(--bg0)] shadow-card hover:bg-[var(--blue)]/90',
        secondary: 'bg-[var(--surface)] text-text border-[var(--border)] hover:bg-[var(--surface2)]',
        ghost: 'bg-transparent text-[var(--textMuted)] hover:bg-[var(--surface)] hover:text-text',
        outline: 'border-[var(--border)] bg-transparent text-text hover:bg-[var(--surface)]',
        destructive: 'bg-[var(--red)] text-[var(--bg0)] hover:bg-[var(--red)]/90',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export const Button = React.forwardRef(({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  const normalizedVariant = variant === 'danger' ? 'destructive' : variant;

  return (
    <Comp
      className={cn(buttonVariants({ variant: normalizedVariant, size }), className)}
      ref={ref}
      {...props}
    />
  );
});

Button.displayName = 'Button';

export { buttonVariants };
