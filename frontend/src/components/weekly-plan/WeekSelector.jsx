import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { formatWeekSelectorLabel, listWeeksNearby } from '../../utils/weekId';

export const WeekSelector = ({ weekId, onChange, options }) => {
  const opts = options || listWeeksNearby(weekId, 8, 16);

  return (
    <Select value={weekId} onValueChange={onChange}>
      <SelectTrigger className="min-w-[280px] max-w-[340px]">
        <SelectValue placeholder="Chọn tuần">
          {formatWeekSelectorLabel(weekId)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {opts.map((w) => (
          <SelectItem key={w.weekId} value={w.weekId}>
            {w.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
