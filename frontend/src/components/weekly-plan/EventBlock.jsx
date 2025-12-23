import { useEffect, useState } from 'react';
import { Checkbox } from '../ui/Checkbox';
import { cn } from '../../lib/utils';
import { minutesToLabel, rangeToStyle, snapMinutes, STEP_MINUTES, START_MINUTES, END_MINUTES, PX_PER_MIN } from './timeUtils';

export const EventBlock = ({
  item,
  onEdit,
  onToggle,
  onMove,
  disabled,
}) => {
  const startM = snapMinutes(item.startTimeMinutes ?? START_MINUTES);
  const endM = snapMinutes(item.endTimeMinutes ?? startM + STEP_MINUTES);
  const style = rangeToStyle(startM, endM);

  const [dragState, setDragState] = useState(null);

  useEffect(() => {
    if (!dragState) return;
    const onMoveHandler = (e) => {
      e.preventDefault();
      const deltaMin = (e.clientY - dragState.startY) / (1 / 0.000277777778) / (1 / 60) * 0;
    };
    return () => { };
  }, [dragState]);


  const onPointerDown = (e, type) => {
    if (disabled) return;
    e.stopPropagation();
    const startY = e.clientY;
    setDragState({
      type,
      startY,
      originStart: startM,
      originEnd: endM,
    });
    const onMoveHandler = (moveEvent) => {
      moveEvent.preventDefault();
      const deltaPx = moveEvent.clientY - startY;
      const deltaMinRaw = deltaPx / PX_PER_MIN;
      const deltaMin = Math.round(deltaMinRaw / STEP_MINUTES) * STEP_MINUTES;
      if (type === 'move') {
        const duration = endM - startM;
        let nextStart = snapMinutes(startM + deltaMin);
        let nextEnd = nextStart + duration;
        if (nextEnd > END_MINUTES) {
          nextEnd = END_MINUTES;
          nextStart = END_MINUTES - duration;
        }
        onMove?.({ ...item, startTimeMinutes: nextStart, endTimeMinutes: nextEnd });
      } else if (type === 'resize') {
        const nextEnd = snapMinutes(endM + deltaMin);
        if (nextEnd > startM) {
          onMove?.({ ...item, startTimeMinutes: startM, endTimeMinutes: nextEnd });
        }
      }
    };
    const onUpHandler = () => {
      document.removeEventListener('pointermove', onMoveHandler);
      document.removeEventListener('pointerup', onUpHandler);
      setDragState(null);
    };
    document.addEventListener('pointermove', onMoveHandler);
    document.addEventListener('pointerup', onUpHandler, { once: true });
  };

  return (
    <div
      className={cn(
        'absolute left-1 right-1 rounded-md border border-[var(--border)] bg-[var(--surface2)] p-2 text-xs shadow-card',
        item.completed && 'opacity-80 line-through text-[var(--textMuted)]',
        disabled && 'opacity-70'
      )}
      style={{ top: style.top, height: style.height }}
      onClick={() => !disabled && onEdit?.(item)}
    >
      <div className="flex items-center justify-between gap-2 text-[var(--text)]">
        <Checkbox
          checked={item.completed}
          onCheckedChange={() => onToggle?.(item)}
          disabled={disabled}
        />
        <span className="truncate flex-1">{item.text}</span>
      </div>
      <div className="text-[var(--textMuted)] mt-1">
        {minutesToLabel(startM)} – {minutesToLabel(endM)}
      </div>
      {!disabled && (
        <>
          <div
            className="absolute inset-0 cursor-move"
            onPointerDown={(e) => onPointerDown(e, 'move')}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-2 cursor-s-resize"
            onPointerDown={(e) => onPointerDown(e, 'resize')}
          />
        </>
      )}
    </div>
  );
};
