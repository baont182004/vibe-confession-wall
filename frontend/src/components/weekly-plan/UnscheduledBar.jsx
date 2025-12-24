import { useMemo, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';

export const UnscheduledBar = ({
  items = [],
  isClosed,
  onAdd,
  onDelete,
}) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return items;
    return items.filter((item) => (item.text || '').toLowerCase().includes(keyword));
  }, [items, query]);

  return (
    <Card className="p-3 flex flex-wrap items-center gap-3">
      <div className="text-sm font-semibold">Chưa sắp xếp</div>
      {onAdd && (
        <Button size="sm" variant="secondary" onClick={onAdd} disabled={isClosed}>
          Thêm
        </Button>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline" disabled={items.length === 0}>
            {items.length ? `Mục (${items.length})` : 'Không có mục'}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 p-3">
          <div className="space-y-2">
            <Input
              placeholder="Tìm kiếm..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {filtered.length === 0 ? (
              <div className="text-xs text-[var(--textMuted)]">Không có mục phù hợp.</div>
            ) : (
              <div className="max-h-64 overflow-auto space-y-2">
                {filtered.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-start justify-between gap-2 rounded-md border border-[var(--border)] bg-[var(--surface2)] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="text-sm truncate">{item.text}</div>
                      {item.dateKey && (
                        <div className="text-xs text-[var(--textMuted)]">{item.dateKey}</div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0"
                      onClick={() => onDelete?.(item)}
                      disabled={isClosed}
                      aria-label="Xóa"
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </Card>
  );
};
