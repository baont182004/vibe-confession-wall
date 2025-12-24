import { cn } from '../../lib/utils';

const StatusRow = ({ label, ok }) => (
  <div className="flex items-center justify-between text-sm">
    <span className="text-[var(--textMuted)]">{label}</span>
    <span className={cn(ok ? 'text-[var(--green)]' : 'text-[var(--red)]')}>
      {ok ? 'Đạt' : 'Chưa đạt'}
    </span>
  </div>
);

export const DailyStreakStatus = ({
  status,
  loading = false,
  error = '',
  variant = 'card',
  className,
}) => {
  if (loading) {
    return <div className="text-sm text-[var(--textMuted)]">Đang tải trạng thái hôm nay...</div>;
  }
  if (error) {
    return <div className="text-sm text-[var(--red)]">Không thể tải trạng thái hôm nay.</div>;
  }
  if (!status) {
    return null;
  }

  const content = (
    <>
      <StatusRow label="Nhật ký" ok={!!status.hasJournal} />
      <StatusRow label="Kế hoạch" ok={!!status.dayPlanDone} />
      <StatusRow label="Đủ điều kiện" ok={!!status.qualified} />
      {status.qualified && status.awardedAt && (
        <div className="text-xs text-[var(--green)]">Hôm nay đã ghi nhận chuỗi.</div>
      )}
    </>
  );

  if (variant === 'plain') {
    return (
      <div className={cn('space-y-1', className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn('rounded-md border border-[var(--border)] bg-[var(--surface2)] px-3 py-2 space-y-1', className)}>
      {content}
    </div>
  );
};
