import { useMemo, useRef, useState } from 'react';
import { EventBlock } from './EventBlock';
import { rangeToStyle, snapMinutes, STEP_MINUTES, START_MINUTES, END_MINUTES, PX_PER_MIN, HOUR_HEIGHT, minutesToLabel } from './timeUtils';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export const DayColumnGrid = ({
  label,
  dateLabel,
  dayIndex,
  items,
  isClosed,
  onAddRange,
  onEditItem,
  onToggleItem,
  onMoveItem,
  unscheduledItems = [],
  onAddUnscheduled,
}) => {
  const [selection, setSelection] = useState(null); // {top,height,start,end}
  const containerRef = useRef(null);

  const selectionRef = useRef(null);

  const handlePointerDown = (e) => {
    if (isClosed) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetY = e.clientY - rect.top;
    const startMin = snapMinutes(START_MINUTES + offsetY / PX_PER_MIN);
    selectionRef.current = { start: startMin, end: snapMinutes(startMin + STEP_MINUTES) };
    const handleMove = (ev) => {
      const currentY = ev.clientY - rect.top;
      const endMin = snapMinutes(START_MINUTES + currentY / PX_PER_MIN);
      const s = Math.min(startMin, endMin);
      const eMin = Math.max(startMin, endMin);
      selectionRef.current = { start: s, end: eMin };
      setSelection({
        top: (s - START_MINUTES) * PX_PER_MIN,
        height: Math.max((eMin - s) * PX_PER_MIN, STEP_MINUTES * PX_PER_MIN),
        start: s,
        end: eMin,
      });
    };
    const handleUp = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      const sel = selectionRef.current || { start: startMin, end: snapMinutes(startMin + STEP_MINUTES) };
      onAddRange?.({ dayIndex, startMinutes: sel.start, endMinutes: sel.end });
      setSelection(null);
      selectionRef.current = null;
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp, { once: true });
  };

  const scheduled = useMemo(() => items.filter(i => i.startTimeMinutes != null && i.endTimeMinutes != null), [items]);
  const unscheduled = useMemo(() => unscheduledItems || items.filter(i => i.startTimeMinutes == null || i.endTimeMinutes == null), [items, unscheduledItems]);

  return (
    <div className="relative flex flex-col border-l border-[var(--border)] w-full">
      <div
        ref={containerRef}
        className="relative flex-1 bg-[var(--bg0)]"
        style={{
          minHeight: (END_MINUTES - START_MINUTES) * PX_PER_MIN,
          backgroundImage: `linear-gradient(to bottom, transparent ${HOUR_HEIGHT - 1}px, var(--border) ${HOUR_HEIGHT}px)`,
          backgroundSize: `100% ${HOUR_HEIGHT}px`,
        }}
        onPointerDown={handlePointerDown}
      >
        {/* Selection preview */}
        {selection && (
          <div
            className="absolute left-1 right-1 rounded-md border border-[var(--blue)] bg-[var(--blue)]/10"
            style={{ top: selection.top, height: selection.height }}
          >
            <div className="absolute left-2 top-1 text-[10px] text-[var(--blue)]">
              {minutesToLabel(selection.start)} – {minutesToLabel(selection.end)}
            </div>
          </div>
        )}

        {/* Events */}
        {scheduled.length === 0 && (
          <div className="absolute left-2 right-2 top-4 text-xs text-[var(--textMuted)]">
            Chưa có công việc
          </div>
        )}
        {scheduled.map((item) => (
          <EventBlock
            key={item._id}
            item={item}
            disabled={isClosed}
            onEdit={onEditItem}
            onToggle={onToggleItem}
            onMove={onMoveItem}
          />
        ))}
      </div>
    </div>
  );
};
