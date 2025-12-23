import { minutesToLabel, HOUR_HEIGHT, TIME_COL_WIDTH } from './timeUtils';

export const TimeRuler = ({ startMinutes, endMinutes, step }) => {
  const rows = [];
  for (let m = startMinutes; m <= endMinutes; m += step) {
    rows.push(m);
  }
  return (
    <div className="sticky left-0 z-10 flex w-full flex-col text-xs text-[var(--textMuted)] border-r border-[var(--border)]" style={{ width: `${TIME_COL_WIDTH}px` }}>
      {rows.map((m) => (
        <div
          key={m}
          className="border-b border-dashed border-[var(--border)] pr-2 text-right flex items-center justify-end"
          style={{ height: `${HOUR_HEIGHT}px` }}
        >
          <span>{minutesToLabel(m)}</span>
        </div>
      ))}
    </div>
  );
};
