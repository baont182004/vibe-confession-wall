import { cn } from '../../lib/utils';

export const StreakBadge = ({
  currentStreak = 0,
  bestStreak = 0,
  compact = false,
  loading = false,
  error = '',
  variant = 'card',
  className,
}) => {
  if (loading) {
    return <div className="text-sm text-[var(--textMuted)]">Đang tải chuỗi...</div>;
  }
  if (error) {
    return <div className="text-sm text-[var(--red)]">Không thể tải chuỗi.</div>;
  }

  const content = (
    <span>
      Chuỗi hiện tại: {currentStreak} | Kỷ lục tốt nhất: {bestStreak}
    </span>
  );

  if (variant === 'plain') {
    return (
      <div className={cn('text-sm text-[var(--text)]', compact && 'text-xs', className)}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-md border border-[var(--border)] bg-[var(--surface2)] px-3 py-2 text-sm',
        compact && 'px-2 py-1 text-xs',
        className
      )}
    >
      {content}
    </div>
  );
};
