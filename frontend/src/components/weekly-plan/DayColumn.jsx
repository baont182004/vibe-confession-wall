import { Button } from '../ui/Button';
import { WeeklyItemCard } from './WeeklyItemCard';
import { cn } from '../../lib/utils';

const compareByTime = (a, b) => {
  const sa = a.startTime ? a.startTime : '99:99';
  const sb = b.startTime ? b.startTime : '99:99';
  if (sa === sb) return 0;
  return sa < sb ? -1 : 1;
};

export const DayColumn = ({ label, dayIndex, items = [], isClosed, onAdd, onEdit, onDelete, onToggle }) => {
  const sorted = [...items].sort(compareByTime);
  const completed = sorted.filter(i => i.completed).length;

  return (
    <div className={cn('flex h-full flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-card')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="text-sm text-[var(--textMuted)]">{label}</div>
          <div className="text-lg font-semibold">{completed}/{sorted.length}</div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => onAdd(dayIndex)} disabled={isClosed}>
          Add
        </Button>
      </div>

      <div className="space-y-2 overflow-auto">
        {sorted.length === 0 ? (
          <div className="text-sm text-[var(--textMuted)]">No items</div>
        ) : (
          sorted.map(item => (
            <WeeklyItemCard
              key={item._id}
              item={item}
              disabled={isClosed}
              onEdit={() => onEdit(item)}
              onDelete={() => onDelete(item)}
              onToggle={() => onToggle(item)}
            />
          ))
        )}
      </div>
    </div>
  );
};
