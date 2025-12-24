import { TimeRuler } from './TimeRuler';
import { DayColumnGrid } from './DayColumnGrid';
import { START_MINUTES, END_MINUTES, TIME_COL_WIDTH, GRID_HEIGHT_PX } from './timeUtils';
import { weekdayLabelFromDateKey } from '../../utils/weekdayLabel';
const GRID_TEMPLATE = `${TIME_COL_WIDTH}px repeat(7, minmax(0, 1fr))`;

export const WeekTimeGrid = ({
  weekDateKeys,
  dayItems,
  legacyMismatchIds,
  highlightLegacy = false,
  isClosed,
  onLocked,
  onAddRange,
  onEditItem,
  onToggleItem,
  trace,
}) => {
  const safeWeekDateKeys = Array.isArray(weekDateKeys) ? weekDateKeys : [];

  const formatShortDate = (dateKey) => {
    if (!dateKey || dateKey.length < 10) return '';
    return `${dateKey.slice(8, 10)}/${dateKey.slice(5, 7)}`;
  };

  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--bg1)] flex flex-col w-full mx-auto">
      <div className="overflow-x-auto">
        <div className="flex flex-col w-full min-w-0">
          <div
            className="grid border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-10"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
          >
            <div className="border-r border-[var(--border)] text-xs font-medium text-[var(--textMuted)] flex items-center justify-center" />
            {safeWeekDateKeys.map((dateKey, idx) => (
              <div
                key={`${dateKey}-${idx}`}
                className="flex items-center justify-center px-3 py-3 text-sm font-semibold border-r border-[var(--border)] last:border-r-0 whitespace-nowrap"
              >
                {weekdayLabelFromDateKey(dateKey)} <span className="ml-1 text-[var(--textMuted)]">({formatShortDate(dateKey)})</span>
              </div>
            ))}
          </div>

          <div
            className="overflow-y-auto"
            style={{
              height: `${GRID_HEIGHT_PX}px`,
              scrollbarGutter: 'stable',
            }}
          >
            <div
              className="grid w-full min-w-0"
              style={{
                gridTemplateColumns: GRID_TEMPLATE,
              }}
            >
              <div className="border-r border-[var(--border)] bg-[var(--bg1)] sticky left-0 z-10">
                <TimeRuler startMinutes={START_MINUTES} endMinutes={END_MINUTES} step={60} />
              </div>
              {safeWeekDateKeys.map((dateKey, idx) => (
                <DayColumnGrid
                  key={`${dateKey}-${idx}`}
                  dayIndex={idx}
                  columnDateKey={dateKey}
                  items={dayItems[idx] || []}
                  legacyMismatchIds={legacyMismatchIds}
                  highlightLegacy={highlightLegacy}
                  isClosed={isClosed}
                  disableToggle={!isClosed}
                  onLocked={onLocked}
                  onAddRange={onAddRange}
                  onEditItem={onEditItem}
                  onToggleItem={onToggleItem}
                  trace={trace}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
