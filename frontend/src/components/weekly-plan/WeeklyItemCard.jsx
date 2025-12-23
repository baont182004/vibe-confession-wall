import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { cn } from '../../lib/utils';

export const WeeklyItemCard = ({ item, disabled, onEdit, onDelete, onToggle }) => {
  const timeLabel = item.startTime
    ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : ''}`
    : 'Any time';

  return (
    <div className={cn(
      'flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--surface2)] p-3',
      item.completed && 'opacity-80'
    )}>
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle?.(item)}
        disabled={disabled}
        className="mt-1"
      />
      <div className="flex-1 space-y-1">
        <div className={cn('text-sm', item.completed && 'line-through text-[var(--textMuted)]')}>
          {item.text}
        </div>
        <div className="text-xs text-[var(--textMuted)] flex flex-wrap gap-2">
          <span>{timeLabel}</span>
          {item.allowedDate && <span className="text-[var(--cyan)]">{item.allowedDate}</span>}
        </div>
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="ghost" onClick={onEdit} disabled={disabled}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={onDelete} disabled={disabled}>Delete</Button>
        </div>
      </div>
    </div>
  );
};
