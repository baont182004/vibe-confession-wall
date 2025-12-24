import { useEffect, useMemo, useState } from 'react';
import { PencilLine } from 'lucide-react';
import { Button } from '../ui/Button';
import { TextArea } from '../ui/Input';
import { updateProfileNote } from '../../services/api';
import { sanitizeNote, getNoteRemaining } from '../../utils/sanitizeNote';

export const ProfileNote = ({ note = '', onSaved, onError }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) setValue(note || '');
  }, [editing, note]);

  const remaining = useMemo(() => getNoteRemaining(value), [value]);
  const sanitized = useMemo(() => sanitizeNote(value), [value]);
  const hasChange = sanitized !== sanitizeNote(note || '');
  const canSave = !!sanitized && hasChange && !saving;

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setValue(note || '');
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await updateProfileNote(sanitized);
      onSaved?.(data.user);
      setEditing(false);
    } catch {
      setError('Không thể cập nhật ghi chú.');
      onError?.('Cập nhật thất bại, thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div className="space-y-2">
        <TextArea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          maxLength={160}
          className="min-h-[90px] text-sm"
          placeholder="Viết một ghi chú ngắn về bạn..."
          disabled={saving}
        />
        <div className="flex items-center justify-between text-xs text-[var(--textMuted)]">
          <span>Còn {remaining} ký tự</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} disabled={!canSave}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
        {error && <div className="text-xs text-[var(--red)]">{error}</div>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="group text-left"
    >
      <div
        className={`text-sm ${note ? 'text-[var(--text)]' : 'text-[var(--textMuted)]'}`}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {note || 'Viết một ghi chú ngắn về bạn...'}
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-[var(--textMuted)] opacity-0 transition group-hover:opacity-100">
        <PencilLine size={12} />
        <span>Chỉnh sửa</span>
      </div>
    </button>
  );
};
