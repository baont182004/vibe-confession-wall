import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { cn } from '../../lib/utils';

export const UnscheduledDialog = ({
  open,
  onOpenChange,
  onSubmit,
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const textRef = useRef(null);
  const remaining = 200 - text.length;

  useEffect(() => {
    if (open) {
      setText('');
      setError('');
    }
  }, [open]);

  useEffect(() => {
    if (open && textRef.current) {
      textRef.current.focus();
    }
  }, [open]);

  const handleSave = async () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 200) {
      setError('Nội dung phải từ 1-200 ký tự.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(trimmed);
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'Không thể lưu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm mục chưa sắp xếp</DialogTitle>
          <DialogDescription>Chỉ ghi chú. Thời gian sẽ được đặt sau trên lịch.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ghi chú</label>
            <TextArea
              ref={textRef}
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= 200) setText(e.target.value);
              }}
              placeholder="Nhập ghi chú..."
            />
            <div className={cn('text-xs text-right', remaining < 0 && 'text-[var(--red)]')}>
              {remaining} ký tự còn lại
            </div>
          </div>

          {error && <div className="text-sm text-[var(--red)]">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Thêm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
