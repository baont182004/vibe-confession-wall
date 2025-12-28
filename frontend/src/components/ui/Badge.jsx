import { cn } from '../../lib/utils';

export const Badge = ({ children, variant = 'secondary', className, ...props }) => {
  const variants = {
    secondary: 'bg-[var(--surface2)] text-text border border-[var(--border)]',
    outline: 'border border-[var(--border)] text-text bg-transparent',
    success: 'bg-warning-soft text-warning-strong border border-warning-border',
    destructive: 'bg-[var(--red)]/15 text-[var(--red)] border border-[var(--red)]/30',
    info: 'bg-[var(--blue)]/15 text-[var(--blue)] border border-[var(--blue)]/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        variants[variant] || variants.secondary,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
