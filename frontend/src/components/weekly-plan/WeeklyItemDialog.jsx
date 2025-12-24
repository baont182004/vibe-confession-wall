import { useEffect, useMemo, useRef, useState } from 'react';
import { toMinutes } from './timeUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { cn } from '../../lib/utils';

export const WeeklyItemDialog = ({
  open,
  onOpenChange,
  initialSelection,
  mode = 'add',
  item,
  unscheduledItems = [],
  onSubmit,
  onDelete,
}) => {
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [unscheduledQuery, setUnscheduledQuery] = useState('');
  const [selectedUnscheduledId, setSelectedUnscheduledId] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef(null);

  const isEdit = mode === 'edit' && !!item;
  const remaining = 200 - text.length;
  const showUnscheduledPicker = !isEdit && !!initialSelection?.startTime && !!initialSelection?.endTime;

  useEffect(() => {
    if (!open) return;
    if (isEdit && item) {
      setText(item.text || '');
      setStartTime(item.startTime || initialSelection?.startTime || '');
      setEndTime(item.endTime || initialSelection?.endTime || '');
    } else if (initialSelection) {
      setText('');
      setStartTime(initialSelection.startTime || '');
      setEndTime(initialSelection.endTime || '');
    } else {
      setText('');
      setStartTime('');
      setEndTime('');
    }
    setUnscheduledQuery('');
    setSelectedUnscheduledId('');
    setError('');
  }, [open, isEdit, item, initialSelection]);

  useEffect(() => {
    if (open && textRef.current) {
      textRef.current.focus();
    }
  }, [open]);

  const availableUnscheduled = useMemo(() => (
    unscheduledItems.filter((it) => !it.startTime || !it.endTime)
  ), [unscheduledItems]);

  const filteredUnscheduled = useMemo(() => {
    if (!showUnscheduledPicker) return [];
    const keyword = unscheduledQuery.trim().toLowerCase();
    if (!keyword) return availableUnscheduled;
    return availableUnscheduled.filter((it) => (it.text || '').toLowerCase().includes(keyword));
  }, [availableUnscheduled, showUnscheduledPicker, unscheduledQuery]);

  const selectedUnscheduled = useMemo(
    () => availableUnscheduled.find((it) => it._id === selectedUnscheduledId),
    [availableUnscheduled, selectedUnscheduledId]
  );

  const addDuration = (base, deltaMinutes) => {
    const m = toMinutes(base);
    const next = (m ?? 0) + deltaMinutes;
    const h = Math.floor(next / 60);
    const mm = next % 60;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const validate = () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 200) return 'Nội dung phải từ 1-200 ký tự.';
    const hasStart = !!startTime;
    const hasEnd = !!endTime;
    if (hasStart || hasEnd) {
      if (!hasStart || !hasEnd) return 'Cần nhập cả giờ bắt đầu và kết thúc.';
      const s = toMinutes(startTime);
      const e = toMinutes(endTime);
      if (s === null || e === null) return 'Định dạng giờ không hợp lệ.';
      if (e <= s) return 'Giờ kết thúc phải sau giờ bắt đầu.';
    }
    return '';
  };

  const handleSave = async () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }
    setSubmitting(true);
    setError('');
    const trimmed = text.trim();
    const payload = {
      text: trimmed,
      startTime,
      endTime,
      dateKey: isEdit ? item?.dateKey : initialSelection?.dateKey,
      weekId: initialSelection?.weekId,
      sourceItemId: selectedUnscheduledId || null,
    };
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Không thể lưu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Sửa công việc' : 'Thêm công việc'}</DialogTitle>
          <DialogDescription>Tối đa 200 ký tự. Có thể chọn giờ trực tiếp trên lịch.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nội dung</label>
            <TextArea
              ref={textRef}
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= 200) setText(e.target.value);
              }}
              placeholder="Ghi chú ngắn..."
            />
            <div className={cn('text-xs text-right', remaining < 0 && 'text-[var(--red)]')}>
              {remaining} ký tự còn lại
            </div>
          </div>

          {showUnscheduledPicker && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn từ danh sách chưa sắp xếp</label>
              <div className="flex flex-wrap items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="justify-between">
                      <span className="truncate max-w-[220px]">
                        {selectedUnscheduled ? selectedUnscheduled.text : 'Chọn mục'}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-72 p-3">
                    <div className="space-y-2">
                      <Input
                        placeholder="Tìm kiếm..."
                        value={unscheduledQuery}
                        onChange={(e) => setUnscheduledQuery(e.target.value)}
                      />
                      {filteredUnscheduled.length === 0 ? (
                        <div className="text-xs text-[var(--textMuted)]">Không có mục phù hợp.</div>
                      ) : (
                        <div className="max-h-40 overflow-auto space-y-2">
                          {filteredUnscheduled.map((unscheduledItem) => {
                            const selected = unscheduledItem._id === selectedUnscheduledId;
                            return (
                              <button
                                key={unscheduledItem._id}
                                type="button"
                                onClick={() => {
                                  setSelectedUnscheduledId(unscheduledItem._id);
                                  setText(unscheduledItem.text || '');
                                }}
                                className={cn(
                                  'w-full rounded-md border border-[var(--border)] bg-[var(--surface2)] px-3 py-2 text-left text-sm transition',
                                  selected && 'border-[var(--blue)]/60 bg-[var(--blue)]/10'
                                )}
                              >
                                <div className="font-medium">{unscheduledItem.text}</div>
                                {unscheduledItem.dateKey && (
                                  <div className="text-xs text-[var(--textMuted)]">{unscheduledItem.dateKey}</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedUnscheduledId && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUnscheduledId('')}
                  >
                    Bỏ chọn
                  </Button>
                )}
              </div>
              {selectedUnscheduled && (
                <div className="text-xs text-[var(--textMuted)]">
                  Đã chọn: {selectedUnscheduled.text}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Giờ bắt đầu</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                onInput={() => error && setError('')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Giờ kết thúc</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onInput={() => error && setError('')}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEndTime(addDuration(startTime || '07:00', 30))}>+30p</Button>
            <Button size="sm" variant="secondary" onClick={() => setEndTime(addDuration(startTime || '07:00', 60))}>+1h</Button>
            <Button size="sm" variant="secondary" onClick={() => setEndTime(addDuration(startTime || '07:00', 120))}>+2h</Button>
          </div>

          {error && <div className="text-sm text-[var(--red)]">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            {isEdit && item?._id && onDelete && (
              <Button variant="destructive" onClick={() => onDelete(item)} disabled={submitting}>
                Xóa
              </Button>
            )}
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={submitting || !!error}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu' : 'Thêm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
