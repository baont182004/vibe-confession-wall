import { useEffect, useRef, useState } from 'react';
import { toMinutes } from './timeUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input, TextArea } from '../ui/Input';
import { cn } from '../../lib/utils';

export const WeeklyItemDialog = ({
  open,
  onOpenChange,
  initialSelection,
  mode = 'add',
  item,
  onSubmit,
  onDelete,
}) => {
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef(null);

  const isEdit = mode === 'edit' && !!item;
  const remaining = 200 - text.length;

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
    setError('');
  }, [open, isEdit, item, initialSelection]);

  useEffect(() => {
    if (open && textRef.current) {
      textRef.current.focus();
    }
  }, [open]);

  const addDuration = (base, deltaMinutes) => {
    const m = toMinutes(base);
    const next = (m ?? 0) + deltaMinutes;
    const h = Math.floor(next / 60);
    const mm = next % 60;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  };

  const validate = () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 200) return 'Nội dung 1-200 ký tự';
    if (!startTime || !endTime) return 'Vui lòng nhập giờ bắt đầu và kết thúc';
    const s = toMinutes(startTime);
    const e = toMinutes(endTime);
    if (s === null || e === null) return 'Định dạng giờ không hợp lệ';
    if (e < s) return 'Giờ kết thúc phải sau giờ bắt đầu';
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
      dayOfWeek: isEdit ? item?.dayOfWeek : initialSelection?.dayOfWeek,
      allowedDate: isEdit ? item?.allowedDate : initialSelection?.allowedDate,
      weekId: initialSelection?.weekId,
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Giờ bắt đầu</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Giờ kết thúc</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
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
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? 'Đang lưu...' : isEdit ? 'Lưu' : 'Thêm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
