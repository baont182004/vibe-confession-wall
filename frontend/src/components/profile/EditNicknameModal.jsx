import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { validateNickname } from '../../utils/validateNickname';
import { updateNickname } from '../../services/api';

export const EditNicknameModal = ({ isOpen, onClose, currentNickname, onSuccess }) => {
  const [value, setValue] = useState(currentNickname || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setValue(currentNickname || '');
      setError('');
      setSaving(false);
    }
  }, [currentNickname, isOpen]);

  const validation = useMemo(() => validateNickname(value), [value]);
  const canSave = validation.valid && value.trim() !== (currentNickname || '').trim() && !saving;

  const handleSave = async () => {
    const result = validateNickname(value);
    if (!result.valid) {
      setError(result.message);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { data } = await updateNickname(value.trim());
      onSuccess?.(data.user);
      onClose?.();
    } catch (err) {
      if (err?.response?.status === 409) {
        setError('Biệt danh đã được sử dụng.');
      } else if (err?.response?.status === 400) {
        setError('Biệt danh phải từ 3-20 ký tự và không có khoảng trắng đầu/cuối.');
      } else {
        setError('Không thể cập nhật biệt danh.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sửa biệt danh">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Biệt danh mới</label>
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={20}
            placeholder="Ví dụ: minhnguyen_92"
            disabled={saving}
          />
          <div className="text-xs text-[var(--textMuted)]">
            Từ 3-20 ký tự, chỉ gồm chữ, số và dấu gạch dưới (_).
          </div>
          {!validation.valid && value && (
            <div className="text-xs text-[var(--red)]">{validation.message}</div>
          )}
        </div>
        {error && (
          <div className="notice is-error">{error}</div>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={!canSave}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
