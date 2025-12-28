import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TextArea, Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/Dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/Popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getJournal, upsertJournal, deleteJournal, getStreak, getStreakStatus } from '../services/api';
import { todayDateKey } from '../utils/dateKey';
import { formatDateDisplay, formatDateShort, formatTimeShort, shiftDateKey } from '../utils/dateVi';
import { cn } from '../lib/utils';
import { StreakBadge } from '../components/streak/StreakBadge';
import { DailyStreakStatus } from '../components/streak/DailyStreakStatus';
import { emitStreakUpdate, traceStreak } from '../utils/streakEvents';
import { AlertTriangle, CheckCircle2, Loader2, MoreHorizontal, Sparkles } from 'lucide-react';

const MAX_CONTENT_LENGTH = 10000;
const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
const RECENT_DAYS = 10;
const AUTOSAVE_DELAY = 2500;

const MOOD_OPTIONS = [
  { value: 'great', label: 'Rất tốt', tone: 'text-warning-strong', badge: 'bg-warning-soft text-warning-strong border-warning-border', card: 'border-warning-border' },
  { value: 'good', label: 'Tốt', tone: 'text-[var(--accent-1)]', badge: 'bg-[var(--accent-1)]/15 text-[var(--accent-1)] border-[var(--accent-1)]/30', card: 'border-[var(--accent-1)]/30' },
  { value: 'neutral', label: 'Bình thường', tone: 'text-[var(--textMuted)]', badge: 'bg-[var(--surface2)] text-text border-[var(--border)]', card: 'border-[var(--border)]' },
  { value: 'low', label: 'Tệ', tone: 'text-warning-strong', badge: 'bg-warning-soft text-warning-strong border-warning-border', card: 'border-warning-border' },
  { value: 'sad', label: 'Rất tệ', tone: 'text-[var(--red)]', badge: 'bg-[var(--red)]/15 text-[var(--red)] border-[var(--red)]/30', card: 'border-[var(--red)]/30' },
];

const PROMPT_POOL = {
  great: [
    'Hôm nay điều gì khiến mình mỉm cười?',
    'Khoảnh khắc nào đáng nhớ nhất trong ngày?',
    'Mình muốn giữ lại điều gì cho ngày mai?',
    'Ai hoặc điều gì làm mình biết ơn hôm nay?',
    'Một điều nhỏ mình đã làm tốt là gì?',
  ],
  good: [
    'Một điều dễ chịu mình cảm nhận hôm nay?',
    'Việc nào giúp mình tiến gần mục tiêu hơn?',
    'Mình muốn tiếp tục duy trì thói quen nào?',
    'Điều gì làm mình cảm thấy nhẹ nhõm?',
    'Mình muốn nhắn nhủ gì với bản thân?',
  ],
  neutral: [
    'Hôm nay trôi qua như thế nào?',
    'Có điều gì khiến mình băn khoăn?',
    'Một việc nhỏ để ngày mai tốt hơn?',
    'Mình muốn điều chỉnh điều gì?',
    'Mình học được gì từ ngày hôm nay?',
  ],
  low: [
    'Điều gì đang làm mình mệt nhất?',
    'Mình cần nghỉ ngơi theo cách nào?',
    'Một người mình muốn trò chuyện lúc này?',
    'Mình có thể làm điều gì thật nhỏ cho bản thân?',
    'Điều gì giúp mình nhẹ lòng hơn một chút?',
  ],
  sad: [
    'Điều gì làm mình thấy nặng lòng?',
    'Mình cần được lắng nghe điều gì?',
    'Một điều tử tế mình có thể dành cho bản thân?',
    'Mình muốn nói gì nếu có ai đó hiểu mình?',
    'Một điều nhỏ giúp mình vững hơn hôm nay?',
  ],
};

const pickPrompts = (pool, count) => {
  const list = [...pool];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, count);
};

const getFirstLine = (value) => {
  if (!value) return '';
  const line = value.split(/\r?\n/).find((item) => item.trim().length > 0);
  return line ? line.trim() : '';
};

export default function JournalPage() {
  const { user } = useAuth();
  const timezone = user?.timezone || DEFAULT_TIMEZONE;
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [selectedDateKey, setSelectedDateKey] = useState(() => todayDateKey(timezone));
  const [content, setContent] = useState('');
  const [lastLoadedContent, setLastLoadedContent] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [saveError, setSaveError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [streak, setStreak] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState('');
  const [dayStatus, setDayStatus] = useState(null);
  const [dayStatusLoading, setDayStatusLoading] = useState(true);
  const [dayStatusError, setDayStatusError] = useState('');
  const [recentStatus, setRecentStatus] = useState({});
  const [recentEntries, setRecentEntries] = useState({});
  const [entryQuery, setEntryQuery] = useState('');
  const [mood, setMood] = useState('neutral');
  const [moodByDate, setMoodByDate] = useState({});
  const [tags, setTags] = useState([]);
  const [tagsByDate, setTagsByDate] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [focusMode, setFocusMode] = useState(false);
  const [promptList, setPromptList] = useState(() => pickPrompts(PROMPT_POOL.neutral, 3));
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [undoEntry, setUndoEntry] = useState(null);
  const statusCacheRef = useRef(new Map());
  const statusAbortRef = useRef(null);
  const autosaveTimerRef = useRef(null);
  const undoTimerRef = useRef(null);

  const isDirty = content !== lastLoadedContent;
  const trimmedContent = content.trim();
  const canSave = trimmedContent.length > 0 && trimmedContent.length <= MAX_CONTENT_LENGTH && isDirty && !saving;
  const canDelete = !!lastLoadedContent && !saving;

  const statusLabel = useMemo(() => {
    if (saveStatus === 'saving' || saving) return 'Đang lưu...';
    if (saveStatus === 'error') return 'Lưu thất bại, thử lại';
    if (isDirty) return 'Chưa lưu';
    if (lastSavedAt) return `Đã lưu • ${formatTimeShort(lastSavedAt)}`;
    return 'Chưa lưu';
  }, [isDirty, lastSavedAt, saveStatus, saving]);

  const recentDates = useMemo(() => {
    return Array.from({ length: RECENT_DAYS }).map((_, idx) => shiftDateKey(selectedDateKey, -idx));
  }, [selectedDateKey]);

  const filteredRecentDates = useMemo(() => {
    const keyword = entryQuery.trim().toLowerCase();
    if (!keyword) return recentDates;
    return recentDates.filter((dateKey) => {
      const display = formatDateDisplay(dateKey).toLowerCase();
      const preview = (recentEntries[dateKey]?.content || '').toLowerCase();
      const tagText = (tagsByDate[dateKey] || []).join(' ').toLowerCase();
      return display.includes(keyword) || preview.includes(keyword) || tagText.includes(keyword);
    });
  }, [entryQuery, recentDates, recentEntries, tagsByDate]);

  const entriesThisPeriod = useMemo(() => {
    return Object.values(recentStatus).filter((status) => status?.hasJournal).length;
  }, [recentStatus]);

  const moodConfig = useMemo(() => {
    return MOOD_OPTIONS.reduce((acc, item) => {
      acc[item.value] = item;
      return acc;
    }, {});
  }, []);

  const currentMood = moodConfig[mood] || moodConfig.neutral;

  useEffect(() => {
    if (!isDirty && saveStatus === 'saved') return;
    if (isDirty && (saveStatus === 'saved' || saveStatus === 'error')) {
      setSaveStatus('idle');
    }
  }, [isDirty, saveStatus]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setLoadError('');
      setSaveStatus('idle');
      setSaveError('');
      try {
        const { data } = await getJournal(selectedDateKey);
        if (!active) return;
        const nextContent = data?.entry?.content || '';
        setContent(nextContent);
        setLastLoadedContent(nextContent);
        setLastSavedAt(data?.entry?.updatedAt || null);
      } catch (err) {
        if (!active) return;
        const message = err?.response?.data?.message || 'Không thể tải nhật ký.';
        setLoadError(message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [selectedDateKey]);

  useEffect(() => {
    setMood(moodByDate[selectedDateKey] || 'neutral');
    setTags(tagsByDate[selectedDateKey] || []);
  }, [moodByDate, selectedDateKey, tagsByDate]);

  useEffect(() => {
    setMoodByDate((prev) => ({ ...prev, [selectedDateKey]: mood }));
  }, [mood, selectedDateKey]);

  useEffect(() => {
    setTagsByDate((prev) => ({ ...prev, [selectedDateKey]: tags }));
  }, [selectedDateKey, tags]);

  useEffect(() => {
    setPromptList(pickPrompts(PROMPT_POOL[mood] || PROMPT_POOL.neutral, 3));
  }, [mood]);

  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    if (!isDirty || saving) return undefined;
    if (!trimmedContent && !lastLoadedContent.trim()) return undefined;
    if (!trimmedContent) return undefined;
    autosaveTimerRef.current = setTimeout(() => {
      handleSave({ source: 'autosave' });
    }, AUTOSAVE_DELAY);
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [content, isDirty, lastLoadedContent, saving, trimmedContent]);

  useEffect(() => {
    const handler = (event) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      handleSave({ source: 'shortcut' });
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  const fetchStreak = async () => {
    setStreakLoading(true);
    setStreakError('');
    try {
      const { data } = await getStreak();
      setStreak(data);
      emitStreakUpdate(data);
    } catch (err) {
      setStreakError(err?.response?.data?.message || 'Không thể tải chuỗi.');
    } finally {
      setStreakLoading(false);
    }
  };

  const applyStreakUpdate = (next, meta = {}) => {
    if (!next) return false;
    setStreak((prev) => {
      traceStreak('client-update', {
        context: 'journal',
        ...meta,
        previous: prev,
        next,
      });
      return next;
    });
    emitStreakUpdate(next);
    return true;
  };

  const applyDayStatusUpdate = (status, dateKey) => {
    if (!status || !dateKey) return;
    statusCacheRef.current.set(dateKey, status);
    if (dateKey === selectedDateKey) {
      setDayStatus(status);
      setDayStatusError('');
    }
    setRecentStatus((prev) => ({ ...prev, [dateKey]: status }));
  };

  const fetchDayStatus = async (dateKey, options = {}) => {
    const { force = false } = options;
    if (!force && statusCacheRef.current.has(dateKey)) {
      setDayStatus(statusCacheRef.current.get(dateKey));
      setDayStatusLoading(false);
      setDayStatusError('');
      return;
    }
    if (statusAbortRef.current) {
      statusAbortRef.current.abort();
    }
    const controller = new AbortController();
    statusAbortRef.current = controller;
    setDayStatusLoading(true);
    setDayStatusError('');
    try {
      const { data } = await getStreakStatus(dateKey, { signal: controller.signal });
      statusCacheRef.current.set(dateKey, data);
      setDayStatus(data);
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setDayStatusError(err?.response?.data?.message || 'Không thể tải trạng thái hôm nay.');
    } finally {
      setDayStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  useEffect(() => {
    fetchDayStatus(selectedDateKey);
  }, [selectedDateKey]);

  useEffect(() => {
    let active = true;
    const loadRecentStatus = async () => {
      const entries = await Promise.all(
        recentDates.map(async (dateKey) => {
          const statusPromise = getStreakStatus(dateKey);
          const entryPromise = getJournal(dateKey);
          const [statusResult, entryResult] = await Promise.allSettled([statusPromise, entryPromise]);
          const status = statusResult.status === 'fulfilled' ? statusResult.value?.data : null;
          const entry = entryResult.status === 'fulfilled' ? entryResult.value?.data?.entry : null;
          return { dateKey, status, entry };
        })
      );
      if (!active) return;
      const nextStatus = {};
      const nextEntries = {};
      entries.forEach(({ dateKey, status, entry }) => {
        if (status) nextStatus[dateKey] = status;
        if (entry) nextEntries[dateKey] = entry;
      });
      setRecentStatus(nextStatus);
      setRecentEntries(nextEntries);
    };
    loadRecentStatus();
    return () => {
      active = false;
    };
  }, [recentDates]);

  const confirmDiscard = () => {
    if (!isDirty) return true;
    return window.confirm('Bỏ các thay đổi chưa lưu?');
  };

  const navigateTo = (nextDateKey) => {
    if (nextDateKey === selectedDateKey) return;
    if (!confirmDiscard()) return;
    setSelectedDateKey(nextDateKey);
  };

  const handleSave = async ({ source } = {}) => {
    if (!canSave) return;
    setSaving(true);
    setSaveStatus('saving');
    setSaveError('');
    try {
      const { data } = await upsertJournal(selectedDateKey, trimmedContent);
      const nextContent = data?.entry?.content || '';
      setContent(nextContent);
      setLastLoadedContent(nextContent);
      setLastSavedAt(data?.entry?.updatedAt || new Date());
      setSaveStatus('saved');
      const streakApplied = applyStreakUpdate(data?.streak, {
        dateKey: selectedDateKey,
      });
      if (!streakApplied) {
        await fetchStreak();
      }
      applyDayStatusUpdate(data?.todayStatus, selectedDateKey);
      await fetchDayStatus(selectedDateKey, { force: true });
      setRecentEntries((prev) => ({ ...prev, [selectedDateKey]: data?.entry }));
    } catch (err) {
      const message = err?.response?.data?.message || 'Không thể lưu.';
      setSaveStatus('error');
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = () => {
    if (!canDelete) return;
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    setSaving(true);
    setSaveStatus('saving');
    setSaveError('');
    try {
      const { data } = await deleteJournal(selectedDateKey);
      const cached = { dateKey: selectedDateKey, content: lastLoadedContent };
      setUndoEntry(cached);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setUndoEntry(null), 8000);
      setContent('');
      setLastLoadedContent('');
      setLastSavedAt(null);
      setSaveStatus('saved');
      setRecentEntries((prev) => {
        const next = { ...prev };
        delete next[selectedDateKey];
        return next;
      });
      const streakApplied = applyStreakUpdate(data?.streak, {
        dateKey: selectedDateKey,
        action: 'delete',
      });
      if (!streakApplied) {
        await fetchStreak();
      }
      applyDayStatusUpdate(data?.todayStatus, selectedDateKey);
      await fetchDayStatus(selectedDateKey, { force: true });
    } catch (err) {
      const message = err?.response?.data?.message || 'Không thể xóa.';
      setSaveStatus('error');
      setSaveError(message);
    } finally {
      setSaving(false);
      setShowDeleteDialog(false);
    }
  };

  const handleUndoDelete = async () => {
    if (!undoEntry) return;
    setSaving(true);
    setSaveStatus('saving');
    setSaveError('');
    try {
      const { data } = await upsertJournal(undoEntry.dateKey, undoEntry.content.trim());
      const nextContent = data?.entry?.content || '';
      if (undoEntry.dateKey === selectedDateKey) {
        setContent(nextContent);
        setLastLoadedContent(nextContent);
        setLastSavedAt(data?.entry?.updatedAt || new Date());
      }
      setRecentEntries((prev) => ({ ...prev, [undoEntry.dateKey]: data?.entry }));
      setSaveStatus('saved');
      const streakApplied = applyStreakUpdate(data?.streak, {
        dateKey: undoEntry.dateKey,
        action: 'undo-delete',
      });
      if (!streakApplied) {
        await fetchStreak();
      }
      applyDayStatusUpdate(data?.todayStatus, undoEntry.dateKey);
      await fetchDayStatus(undoEntry.dateKey, { force: true });
      setUndoEntry(null);
    } catch (err) {
      const message = err?.response?.data?.message || 'Không thể hoàn tác.';
      setSaveStatus('error');
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (value) => {
    const next = value.trim();
    if (!next) return;
    if (tags.some((tag) => tag.toLowerCase() === next.toLowerCase())) return;
    setTags((prev) => [...prev, next]);
    setTagInput('');
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag(tagInput);
      return;
    }
    if (event.key === 'Backspace' && !tagInput && tags.length) {
      event.preventDefault();
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const allTagSuggestions = useMemo(() => {
    const collected = new Set();
    Object.values(tagsByDate).forEach((list) => {
      (list || []).forEach((item) => collected.add(item));
    });
    return Array.from(collected);
  }, [tagsByDate]);

  const filteredTagSuggestions = useMemo(() => {
    const keyword = tagInput.trim().toLowerCase();
    if (!keyword) return [];
    return allTagSuggestions.filter(
      (item) =>
        item.toLowerCase().includes(keyword) &&
        !tags.some((tag) => tag.toLowerCase() === item.toLowerCase())
    );
  }, [allTagSuggestions, tagInput, tags]);

  const selectedStatus = recentStatus[selectedDateKey];
  const prevDateKey = shiftDateKey(selectedDateKey, -1);
  const nextDateKey = shiftDateKey(selectedDateKey, 1);
  const todayKey = todayDateKey(timezone);
  const selectedPreview = getFirstLine(lastLoadedContent);

  const renderRecentList = () => (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Danh sách gần đây</div>
        <span className="text-xs text-[var(--textMuted)]">{RECENT_DAYS} ngày</span>
      </div>
      <Input
        placeholder="Tìm nội dung hoặc thẻ..."
        value={entryQuery}
        onChange={(e) => setEntryQuery(e.target.value)}
      />
      <div className="max-h-[320px] overflow-auto space-y-2">
        {filteredRecentDates.length === 0 ? (
          <div className="text-xs text-[var(--textMuted)] py-4 text-center">Không tìm thấy nhật ký phù hợp.</div>
        ) : (
          filteredRecentDates.map((dateKey) => {
            const status = recentStatus[dateKey];
            const active = dateKey === selectedDateKey;
            const entry = recentEntries[dateKey];
            const preview = getFirstLine(entry?.content || '');
            const moodValue = moodByDate[dateKey];
            const moodInfo = moodValue ? moodConfig[moodValue] : null;
            const entryTags = tagsByDate[dateKey] || [];
            const visibleTags = entryTags.slice(0, 2);
            const remainingTags = entryTags.length - visibleTags.length;
            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => navigateTo(dateKey)}
                className={cn(
                  'w-full text-left rounded-md border px-3 py-2 transition space-y-1',
                  active
                    ? 'border-[var(--accent-1)]/60 bg-[var(--accent-1)]/10 text-[var(--text)]'
                    : 'border-[var(--border)] bg-[var(--surface2)] text-[var(--text)] hover:bg-[var(--surface)]'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">{formatDateDisplay(dateKey)}</div>
                  {moodInfo && (
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', moodInfo.badge)}>
                      {moodInfo.label}
                    </span>
                  )}
                </div>
                <div className="text-xs text-[var(--textMuted)]">
                  {preview || (status?.hasJournal ? 'Đã có nhật ký.' : 'Chưa ghi.')}
                </div>
                {entryTags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    {visibleTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--textMuted)]">
                        {tag}
                      </span>
                    ))}
                    {remainingTags > 0 && (
                      <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] text-[var(--textMuted)]">
                        +{remainingTags}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </Card>
  );

  const renderOverview = () => (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Tổng quan</div>
        <Sparkles size={16} className="text-warning-strong" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StreakBadge
          compact
          currentStreak={streak?.currentStreak || 0}
          bestStreak={streak?.bestStreak || 0}
          loading={streakLoading}
          error={streakError}
        />
        <div className="text-sm text-[var(--textMuted)]">Tuần này: {entriesThisPeriod} mục</div>
      </div>
      <DailyStreakStatus status={dayStatus} loading={dayStatusLoading} error={dayStatusError} variant="card" />
    </Card>
  );

  const renderHeader = () => (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Nhật ký DearPeer</div>
          <div className="text-sm text-[var(--textMuted)]">{formatDateDisplay(selectedDateKey)}</div>
        </div>
        <Badge variant="secondary">{selectedStatus?.hasJournal ? 'Đã viết' : 'Chưa viết'}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="ghost" onClick={() => navigateTo(prevDateKey)}>
          Trước ({formatDateShort(prevDateKey)})
        </Button>
        <Button size="sm" variant="secondary" onClick={() => navigateTo(todayKey)}>
          Hôm nay ({formatDateShort(todayKey)})
        </Button>
        <Button size="sm" variant="ghost" onClick={() => navigateTo(nextDateKey)}>
          Sau ({formatDateShort(nextDateKey)})
        </Button>
      </div>
    </Card>
  );

  const renderEditor = () => (
    <Card className={cn('p-5 space-y-4 border', currentMood.card)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Nhật ký</div>
          <div className="text-sm text-[var(--textMuted)]">Viết như một lá thư gửi chính mình.</div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant={focusMode ? 'secondary' : 'ghost'}
            onClick={() => setFocusMode((prev) => !prev)}
          >
            {focusMode ? 'Thoát tập trung' : 'Tập trung'}
          </Button>
          <div className="flex items-center gap-2 text-sm text-[var(--textMuted)]">
            {saving ? <Loader2 size={16} className="animate-spin" /> : saveStatus === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
            <span>{statusLabel}</span>
          </div>
        </div>
      </div>

      {saveStatus === 'error' && (
        <div className="rounded-md border border-[var(--red)]/40 bg-[var(--red)]/10 px-3 py-2 text-sm text-[var(--red)]">
          {saveError || 'Lưu thất bại, thử lại.'}
        </div>
      )}
      {loadError && (
        <div className="rounded-md border border-[var(--red)]/40 bg-[var(--red)]/10 px-3 py-2 text-sm text-[var(--red)]">
          {loadError}
        </div>
      )}
      {loading && <div className="text-sm text-[var(--textMuted)]">Đang tải nhật ký...</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-[var(--textMuted)]">Tâm trạng</label>
          <div className="flex flex-wrap gap-2">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-semibold transition',
                  option.badge,
                  mood === option.value ? 'shadow-[0_0_0_2px_rgba(222,181,215,0.4)]' : 'opacity-80 hover:opacity-100'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-[var(--textMuted)]">Thẻ gợi nhớ</label>
          <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((item) => item !== tag))}
                    className="text-[10px] text-[var(--textMuted)] hover:text-text"
                    aria-label={`Xóa thẻ ${tag}`}
                  >
                    x
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => handleAddTag(tagInput)}
                placeholder={tags.length ? 'Thêm thẻ...' : 'Ví dụ: gia đình, công việc'}
                className="min-w-[120px] flex-1 bg-transparent text-sm text-text placeholder:text-[var(--textMuted)] outline-none"
              />
            </div>
          </div>
          {filteredTagSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filteredTagSuggestions.slice(0, 6).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleAddTag(item)}
                  className="rounded-full border border-[var(--border)] px-2 py-1 text-xs text-[var(--textMuted)] hover:text-text hover:bg-[var(--surface2)]"
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Viết điều bạn muốn giữ lại cho bản thân. Gợi ý: cảm xúc, một điều biết ơn, một việc nhỏ ngày mai."
        maxLength={MAX_CONTENT_LENGTH}
        disabled={loading || saving}
        className="input--textarea min-h-[340px] leading-7 p-4 text-base"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="text-[var(--textMuted)]">
          {content.length}/{MAX_CONTENT_LENGTH} ký tự
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="primary" onClick={() => handleSave({ source: 'manual' })} disabled={!canSave} aria-label="Lưu nhật ký">
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Lưu
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" aria-label="Thêm hành động">
                <MoreHorizontal size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-2 w-44">
              <button
                type="button"
                onClick={openDeleteDialog}
                disabled={!canDelete}
                className="w-full text-left rounded-md px-3 py-2 text-sm text-[var(--red)] hover:bg-[var(--red)]/10 disabled:opacity-60"
              >
                Xóa nhật ký
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );

  const renderPrompts = () => (
    <Card className="p-4 space-y-3 border-dashed border-[var(--border)] bg-[var(--surface2)]">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">Gợi ý viết nhanh</div>
        <Button size="sm" variant="ghost" onClick={() => setPromptList(pickPrompts(PROMPT_POOL[mood] || PROMPT_POOL.neutral, 3))}>
          Đổi gợi ý
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {promptList.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() =>
              setContent((prev) => `${prev.trimEnd()}${prev.trim() ? '\n' : ''}${prompt}\n`)
            }
            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--textMuted)] hover:text-text hover:bg-[var(--surface)]"
          >
            {prompt}
          </button>
        ))}
      </div>
    </Card>
  );

  const renderDeleteDialog = () => (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa nhật ký</DialogTitle>
          <DialogDescription>
            {formatDateDisplay(selectedDateKey)}
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border border-[var(--border)] bg-[var(--surface2)] p-3 text-sm text-[var(--textMuted)]">
          {selectedPreview || 'Không có nội dung để hiển thị.'}
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setShowDeleteDialog(false)}>
            Hủy
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete} disabled={saving}>
            Xóa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderUndoToast = () => {
    if (!undoEntry) return null;
    return (
      <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm shadow-lg">
        <div className="flex items-center gap-3">
          <div>Đã xóa nhật ký. Hoàn tác?</div>
          <Button size="sm" variant="secondary" onClick={handleUndoDelete}>
            Hoàn tác
          </Button>
        </div>
      </div>
    );
  };

  const renderSidebar = () => (
    <div className={cn('flex flex-col gap-4', focusMode ? 'hidden' : 'lg:w-[35%]')}>
      {renderHeader()}
      {renderOverview()}
      {renderRecentList()}
    </div>
  );

  const renderEditorColumn = () => (
    <div className={cn('flex flex-col gap-4', focusMode ? 'lg:w-full' : 'lg:w-[65%]')}>
      {renderEditor()}
      {renderPrompts()}
    </div>
  );

  return (
    <div className={cn('container', focusMode ? 'space-y-2' : 'space-y-4')}>
      {renderDeleteDialog()}
      {renderUndoToast()}
      {isMobile ? (
        <Tabs defaultValue="viet">
          <TabsList className="w-full justify-between">
            <TabsTrigger value="danh-sach">Danh sách</TabsTrigger>
            <TabsTrigger value="viet">Viết</TabsTrigger>
            <TabsTrigger value="tong-quan">Tổng quan</TabsTrigger>
          </TabsList>
          <TabsContent value="danh-sach" className="space-y-4">
            {renderHeader()}
            {renderRecentList()}
          </TabsContent>
          <TabsContent value="viet" className="space-y-4">
            {renderEditorColumn()}
          </TabsContent>
          <TabsContent value="tong-quan" className="space-y-4">
            {renderOverview()}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row">
          {renderSidebar()}
          {renderEditorColumn()}
        </div>
      )}
    </div>
  );
}
