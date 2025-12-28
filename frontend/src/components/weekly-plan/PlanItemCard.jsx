import { useRef } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { cn } from '../../lib/utils';

export const PlanItemCard = ({
  item,
  disableActions,
  disableToggle,
  onEdit,
  onDelete,
  onToggle,
  compact = false,
  className,
}) => {
  const clickLockRef = useRef(false);
  const timeLabel = item.startTime
    ? `${item.startTime}${item.endTime ? ` – ${item.endTime}` : ''}`
    : '';

  const handleToggle = (event) => {
    if (disableToggle) return;
    if (event?.target?.closest?.('[data-stop-toggle="true"]')) return;
    const selection = window.getSelection?.();
    if (selection && selection.toString()) return;
    if (clickLockRef.current) return;
    onToggle?.(item);
  };

  return (
    <div
      className={cn(
        'group relative flex min-h-[44px] items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--surface2)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-plan)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg0)]',
        compact ? 'p-2 text-xs' : 'p-3',
        item.completed && 'opacity-80',
        !disableToggle && 'cursor-pointer hover:shadow-[0_0_0_1px_rgba(222,181,215,0.35)]',
        className
      )}
      role="button"
      tabIndex={disableToggle ? -1 : 0}
      aria-label={`Đánh dấu hoàn thành: ${item.text}`}
      onClick={handleToggle}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleToggle(event);
        }
      }}
    >
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle?.(item)}
        disabled={disableToggle}
        className={compact ? 'mt-0.5' : 'mt-1'}
        aria-label={`Hoàn thành: ${item.text}`}
        data-stop-toggle="true"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className={cn('text-sm', compact && 'text-xs', item.completed && 'line-through text-[var(--textMuted)]')}>
          {item.text}
        </div>
        <div className="text-xs text-[var(--textMuted)] flex flex-wrap gap-2">
          {timeLabel && <span>{timeLabel}</span>}
          {item.dateKey && <span className="text-[var(--accent-plan)]">{item.dateKey}</span>}
        </div>
        {(onEdit || onDelete) && (
          <div className={cn('flex gap-2 pt-1', compact && 'pt-0')}>
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  clickLockRef.current = true;
                  onEdit();
                  setTimeout(() => {
                    clickLockRef.current = false;
                  }, 0);
                }}
                disabled={disableActions}
                aria-label="Sửa công việc"
                data-stop-toggle="true"
              >
                <Pencil size={14} />
                {!compact && 'Sửa'}
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(event) => {
                  event.stopPropagation();
                  clickLockRef.current = true;
                  onDelete();
                  setTimeout(() => {
                    clickLockRef.current = false;
                  }, 0);
                }}
                disabled={disableActions}
                aria-label="Xóa công việc"
                data-stop-toggle="true"
              >
                <Trash2 size={14} />
                {!compact && 'Xóa'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
