import { useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Checkbox } from '../ui/Checkbox';
import { cn } from '../../lib/utils';
import { minutesToLabel, rangeToStyle, snapMinutes, STEP_MINUTES, START_MINUTES } from './timeUtils';

export const EventBlock = ({
  item,
  onEdit,
  onToggle,
  disableActions,
  disableToggle,
  isLegacyMismatch,
  columnDateKey,
  trace,
}) => {
  const startM = snapMinutes(item.startTimeMinutes ?? START_MINUTES);
  const endM = snapMinutes(item.endTimeMinutes ?? startM + STEP_MINUTES);
  const style = rangeToStyle(startM, endM);

  useEffect(() => {
    if (typeof trace !== 'function') return;
    trace('render-item', {
      id: item._id,
      dateKey: item.dateKey ?? item.allowedDate ?? null,
      columnDateKey,
    });
  }, [trace, item._id, item.dateKey, item.allowedDate, columnDateKey]);

  const handleToggle = (event) => {
    if (disableToggle) return;
    if (event.target.closest?.('[data-checkbox="true"]')) return;
    if (event.target.closest?.('[data-action="edit"]')) return;
    const selection = window.getSelection?.();
    if (selection && selection.toString()) return;
    onToggle?.(item);
  };

  return (
    <div
      className={cn(
        'group absolute left-1 right-1 cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface2)] p-2 text-xs shadow-card transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-plan)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)]',
        item.completed && 'opacity-80 text-[var(--textMuted)]',
        isLegacyMismatch && 'border-[var(--blue)] ring-1 ring-[var(--blue)]'
      )}
      style={{ top: style.top, height: style.height }}
      onClick={handleToggle}
      role="checkbox"
      tabIndex={disableToggle ? -1 : 0}
      aria-checked={!!item.completed}
      aria-label={`Đánh d?u hoàn thành: ${item.text}`}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (!disableToggle) onToggle?.(item);
        }
      }}
    >
      <div className={cn('flex items-center justify-between gap-2 text-[var(--text)]', item.completed && 'line-through')}>
        <Checkbox
          checked={item.completed}
          onCheckedChange={() => onToggle?.(item)}
          disabled={disableToggle}
          aria-label={`Hoàn thành: ${item.text}`}
          data-checkbox="true"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        />
        <span className="truncate flex-1">{item.text}</span>
        {!disableActions && (
          <button
            type="button"
            className="rounded-md p-1 text-[var(--textMuted)] opacity-0 transition group-hover:opacity-100 hover:text-[var(--text)] hover:bg-[var(--surface)]"
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(item);
            }}
            onPointerDown={(event) => event.stopPropagation()}
            aria-label="S?a công vi?c"
            data-action="edit"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
      <div className="text-[var(--textMuted)] mt-1">
        {minutesToLabel(startM)} – {minutesToLabel(endM)}
      </div>
    </div>
  );
};
