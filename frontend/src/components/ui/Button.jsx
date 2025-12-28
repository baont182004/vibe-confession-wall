import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-[calc(var(--radius)-4px)] border border-transparent font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)] disabled:pointer-events-none disabled:opacity-60 active:scale-[0.98] shadow-sm',
  {
    variants: {
      variant: {
        primary:
          'bg-[linear-gradient(135deg,#BFAEE3,#DEB5D7_45%,#FEC5E6)] text-[var(--textStrong)] shadow-[0_10px_22px_rgba(222,181,215,0.35)] hover:brightness-105 hover:shadow-[0_14px_26px_rgba(191,174,227,0.35)]',
        secondary:
          'bg-[var(--surface)] text-text border border-[var(--border)] hover:bg-[var(--surface2)]',
        ghost:
          'bg-transparent text-[var(--textMuted)] hover:bg-[rgba(222,181,215,0.25)] hover:text-text',
        outline:
          'border border-[var(--border)] bg-transparent text-text hover:bg-[rgba(222,181,215,0.2)]',
        destructive:
          'bg-[rgba(254,197,230,0.6)] text-[var(--textStrong)] border border-[rgba(222,181,215,0.7)] hover:bg-[rgba(254,197,230,0.75)]',
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
