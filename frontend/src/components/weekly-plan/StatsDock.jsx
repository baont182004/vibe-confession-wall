import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { DailyStreakStatus } from '../streak/DailyStreakStatus';
import { cn } from '../../lib/utils';

export const StatsDock = ({
  todayStatus,
  todayStatusLoading,
  todayStatusError,
  compact = false,
  variant = 'overlay',
  className,
  children,
}) => {
  const content = (
    <div className="flex flex-col gap-3">
      <Card className={cn(
        'border-[var(--border)] bg-[var(--surface)] shadow-card border-l-4 border-l-[var(--accent-journal)]',
        compact ? 'p-2' : 'p-3'
      )}>
        <div className="text-xs uppercase tracking-wide text-[var(--textMuted)] mb-2">
          Trạng thái hôm nay
        </div>
        <DailyStreakStatus
          status={todayStatus}
          loading={todayStatusLoading}
          error={todayStatusError}
          variant="plain"
        />
      </Card>
      {children}
    </div>
  );

  if (variant === 'mobile') {
    return (
      <div className={cn('statsDockMobileButton', className)}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="shadow-card border-[var(--border)]"
              aria-label="Mở thống kê"
            >
              Thống kê
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-3">
            {content}
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <aside className={cn('statsDockInCard', className)}>
      <div className="statsDockInner">
        {content}
      </div>
    </aside>
  );
};
