import { TimeRuler } from './TimeRuler';
import { DayColumnGrid } from './DayColumnGrid';
import { START_MINUTES, END_MINUTES, TIME_COL_WIDTH, GRID_HEIGHT_PX } from './timeUtils';
import { format } from 'date-fns';

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
const GRID_TEMPLATE = `${TIME_COL_WIDTH}px repeat(7, minmax(0, 1fr))`;

export const WeekTimeGrid = ({
  weekDates,
  dayItems,
  isClosed,
  onAddRange,
  onEditItem,
  onToggleItem,
  onMoveItem,
  onAddUnscheduled,
}) => {
  return (
    <div className="border border-[var(--border)] rounded-lg bg-[var(--bg1)] flex flex-col w-full mx-auto">
      <div className="overflow-x-auto">
        <div className="flex flex-col w-full min-w-0">
          <div
            className="grid border-b border-[var(--border)] bg-[var(--surface)] sticky top-0 z-10"
            style={{ gridTemplateColumns: GRID_TEMPLATE }}
          >
            <div className="border-r border-[var(--border)] text-xs font-medium text-[var(--textMuted)] flex items-center justify-center" />
            {weekDates.map((d, idx) => (
              <div
                key={`${format(d, 'yyyy-MM-dd')}-${idx}`}
                className="flex items-center justify-center px-3 py-3 text-sm font-semibold border-r border-[var(--border)] last:border-r-0 whitespace-nowrap"
              >
                {DAY_LABELS[idx] || format(d, 'EEE')} <span className="ml-1 text-[var(--textMuted)]">({format(d, 'dd/MM')})</span>
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
              {weekDates.map((d, idx) => (
                <DayColumnGrid
                  key={`${format(d, 'yyyy-MM-dd')}-${idx}`}
                  label={DAY_LABELS[idx] || format(d, 'EEE')}
                  dateLabel={format(d, 'dd/MM')}
                  dayIndex={idx}
                  items={dayItems[idx] || []}
                  isClosed={isClosed}
                  onAddRange={onAddRange}
                  onEditItem={onEditItem}
                  onToggleItem={onToggleItem}
                  onMoveItem={onMoveItem}
                  onAddUnscheduled={onAddUnscheduled}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
