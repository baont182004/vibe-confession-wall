import { cn } from '../../lib/utils';

export const Progress = ({ value = 0, className, ...props }) => {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className={cn('relative h-3 w-full overflow-hidden rounded-full bg-[var(--surface2)]', className)}
      {...props}
    >
      <div
        className="h-full bg-[var(--blue)] transition-all"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
