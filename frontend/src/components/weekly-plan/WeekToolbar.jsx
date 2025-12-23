import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { formatWeekSelectorLabel, listWeeksNearby } from '../../utils/weekId';
import { WeekSelector } from './WeekSelector';

export const WeekToolbar = ({
  weekId,
  weekDates = [],
  isClosed,
  score,
  onPrev,
  onNext,
  onToday,
  onClose,
  onReopen,
  onSelectWeek,
}) => {
  const rangeLabel = weekDates.length
    ? `${format(weekDates[0], 'dd/MM')} – ${format(weekDates[6], 'dd/MM')}`
    : '';
  const weekOptions = listWeeksNearby(weekId, 8, 16);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Kế hoạch tuần</h1>
          <Badge variant={isClosed ? 'outline' : 'secondary'}>
            {isClosed ? 'Đã khóa' : 'Đang mở'}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onPrev}>Trước</Button>
          <Button variant="ghost" onClick={onNext}>Sau</Button>
          <Button variant="secondary" onClick={onToday}>Tuần này</Button>
          {isClosed ? (
            <Button variant="secondary" onClick={onReopen}>Mở lại tuần</Button>
          ) : (
            <Button variant="primary" onClick={onClose}>Đóng tuần</Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <WeekSelector weekId={weekId} onChange={onSelectWeek} options={weekOptions} />
        <div className="text-sm text-[var(--textMuted)]">{rangeLabel}</div>
        {isClosed && (
          <div className="flex items-center gap-2 text-sm">
            <Progress value={score || 0} className="w-40" />
            <span className="text-[var(--textMuted)]">{Math.round(score || 0)}% hoàn thành</span>
          </div>
        )}
      </div>
    </div>
  );
};
