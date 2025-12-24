import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
export const UnscheduledList = ({
  items = [],
  isClosed,
  onAdd,
  onDelete,
  onSchedule,
  className,
  listClassName,
}) => {
  return (
    <Card className={['p-3 space-y-3', className].filter(Boolean).join(' ')}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Chưa sắp xếp</div>
        {onAdd && (
          <Button size="sm" variant="secondary" onClick={onAdd} disabled={isClosed}>
            Thêm
          </Button>
        )}
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-[var(--textMuted)]">Không có mục chưa sắp xếp.</div>
      ) : (
        <div className={['space-y-2', listClassName].filter(Boolean).join(' ')}>
          {items.map((item) => (
            <div
              key={item._id}
              className="relative rounded-md border border-[var(--border)] bg-[var(--surface2)] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-sm">{item.text}</div>
                <div className="flex items-center gap-1">
                  {onSchedule && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSchedule(item)}
                      disabled={isClosed}
                    >
                      Đặt lịch
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDelete?.(item)}
                    disabled={isClosed}
                    aria-label="Xóa"
                  >
                    X
                  </Button>
                </div>
              </div>
              <div className="text-xs text-[var(--textMuted)] flex flex-wrap gap-2 pt-1">
                {item.dateKey && <span className="text-[var(--cyan)]">{item.dateKey}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
