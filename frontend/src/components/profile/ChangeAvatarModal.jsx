import { useEffect, useMemo, useState } from 'react';
import { Check, Shuffle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Avatar } from '../ui/Avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { updateAvatar } from '../../services/api';
import { getDefaultAvatarById } from '../../utils/avatar';

const PAGE_SIZE = 12;
const ALL_CATEGORY = 'all';

export const filterAvatars = (query, category, avatars) => {
  const normalizedQuery = query.trim().toLowerCase();
  return avatars.filter((avatar) => {
    const title = (avatar.title || '').toLowerCase();
    const tags = (avatar.tags || []).map((tag) => tag.toLowerCase());
    const matchesQuery = !normalizedQuery
      || title.includes(normalizedQuery)
      || tags.some((tag) => tag.includes(normalizedQuery));
    const matchesCategory = !category || category === ALL_CATEGORY
      || tags.includes(category.toLowerCase());
    return matchesQuery && matchesCategory;
  });
};

export const ChangeAvatarModal = ({ isOpen, onClose, user, onSuccess, onError }) => {
  const [avatars, setAvatars] = useState([]);
  const [avatarsLoading, setAvatarsLoading] = useState(false);
  const [avatarsError, setAvatarsError] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState(user?.avatarId || 1);
  const [initialAvatarId, setInitialAvatarId] = useState(user?.avatarId || 1);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isSaveDisabled = saving || !selectedAvatarId || selectedAvatarId === initialAvatarId;

  useEffect(() => {
    if (!isOpen) return;
    setSelectedAvatarId(user?.avatarId || 1);
    setInitialAvatarId(user?.avatarId || 1);
    setSearchText('');
    setSelectedCategory(ALL_CATEGORY);
    setPage(1);
    setError('');
  }, [isOpen, user?.avatarId]);

  useEffect(() => {
    let isMounted = true;
    if (!isOpen) return () => {};
    const loadAvatars = async () => {
      setAvatarsLoading(true);
      setAvatarsError('');
      try {
        const response = await fetch('/avatars/avatars.json');
        if (!response.ok) throw new Error('Failed');
        const data = await response.json();
        if (isMounted) setAvatars(Array.isArray(data) ? data : []);
      } catch (err) {
        if (isMounted) {
          setAvatars([]);
          setAvatarsError('Không thể tải danh sách ảnh đại diện. Vui lòng thử lại.');
        }
      } finally {
        if (isMounted) setAvatarsLoading(false);
      }
    };
    loadAvatars();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    setPage(1);
  }, [searchText, selectedCategory]);

  const selectedAvatar = useMemo(
    () => avatars.find((avatar) => avatar.id === selectedAvatarId) || avatars[0],
    [avatars, selectedAvatarId]
  );
  const previewSrc = useMemo(() => getDefaultAvatarById(selectedAvatarId), [selectedAvatarId]);
  const popularTags = useMemo(() => {
    const counts = new Map();
    avatars.forEach((avatar) => {
      (avatar.tags || []).forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [avatars]);
  const filteredAvatars = useMemo(
    () => filterAvatars(searchText, selectedCategory, avatars),
    [avatars, searchText, selectedCategory]
  );
  const visibleAvatars = useMemo(
    () => filteredAvatars.slice(0, page * PAGE_SIZE),
    [filteredAvatars, page]
  );

  const handleSave = async (overrideId) => {
    const nextId = overrideId || selectedAvatarId;
    if (!nextId || nextId === initialAvatarId) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await updateAvatar(nextId);
      onSuccess?.({ ...data.user, avatarId: nextId, updatedAt: Date.now() });
      onClose?.();
    } catch (err) {
      if (err?.response?.status === 400) {
        setError('Ảnh đại diện không hợp lệ. Vui lòng chọn lại.');
      } else {
        setError('Không thể cập nhật ảnh đại diện. Vui lòng thử lại.');
      }
      onError?.('Cập nhật thất bại, thử lại.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (event) => {
      if (event.key !== 'Enter') return;
      if (isSaveDisabled) return;
      event.preventDefault();
      handleSave();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, isSaveDisabled]);

  const handleRandomPick = () => {
    if (!filteredAvatars.length) return;
    const random = filteredAvatars[Math.floor(Math.random() * filteredAvatars.length)];
    if (random?.id) setSelectedAvatarId(random.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chọn ảnh đại diện">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm text-[var(--textMuted)]">
              Ảnh đại diện hiển thị ở Bảng tin & Nhật ký.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Avatar src={previewSrc} size={44} loading="lazy" decoding="async" />
            <div className="text-xs text-[var(--textMuted)]">Đã chọn</div>
          </div>
        </div>

        {avatarsLoading && <div className="notice">Đang tải ảnh đại diện...</div>}
        {avatarsError && <div className="notice is-error">{avatarsError}</div>}

        {!avatarsLoading && !avatarsError && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Tìm theo tên hoặc tag..."
                className="flex-1 min-w-[200px]"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="min-w-[160px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORY}>Tất cả</SelectItem>
                  {popularTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm" onClick={handleRandomPick}>
                <Shuffle size={14} />
                Ngẫu nhiên
              </Button>
              {(searchText || selectedCategory !== ALL_CATEGORY) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchText('');
                    setSelectedCategory(ALL_CATEGORY);
                  }}
                >
                  Xóa lọc
                </Button>
              )}
            </div>

            {filteredAvatars.length === 0 ? (
              <div className="notice">Không tìm thấy avatar phù hợp.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {visibleAvatars.map((avatar) => {
                    const active = selectedAvatarId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        className={`relative rounded-xl border p-2 transition ${active ? 'border-[var(--accent-1)] bg-[var(--accent-1)]/10' : 'border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)]'}`}
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        onDoubleClick={() => handleSave(avatar.id)}
                        aria-label={`Chọn ${avatar.title}`}
                        title={avatar.title}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Avatar src={`/avatars/${avatar.file}`} size={64} loading="lazy" decoding="async" />
                          <div className="text-[11px] text-[var(--textMuted)]">{avatar.title}</div>
                        </div>
                        {active && (
                          <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-1)] text-[var(--bg0)]">
                            <Check size={14} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {filteredAvatars.length > visibleAvatars.length && (
                  <div className="flex justify-center mt-3">
                    <Button variant="ghost" size="sm" onClick={() => setPage((prev) => prev + 1)}>
                      Xem thêm
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {error && <div className="notice is-error">{error}</div>}
        {!selectedAvatarId && (
          <div className="text-xs text-[var(--textMuted)]">Vui lòng chọn ảnh đại diện để tiếp tục.</div>
        )}

        <div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface)]/95 py-3 backdrop-blur">
          <div className="text-xs text-[var(--textMuted)]">
            Đã chọn: {selectedAvatar?.title || 'Avatar'} (#{selectedAvatarId || '-'})
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose} disabled={saving}>
              Hủy
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleSave()} disabled={isSaveDisabled}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
