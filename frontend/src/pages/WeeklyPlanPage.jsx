import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { WeekToolbar } from '../components/weekly-plan/WeekToolbar';
import { WeeklyItemDialog } from '../components/weekly-plan/WeeklyItemDialog';
import { CloseWeekDialog } from '../components/weekly-plan/CloseWeekDialog';
import { WeekTimeGrid } from '../components/weekly-plan/WeekTimeGrid';
import { UnscheduledList } from '../components/weekly-plan/UnscheduledList';
import { UnscheduledDialog } from '../components/weekly-plan/UnscheduledDialog';
import { getWeeklyPlan, addWeeklyItem, updateWeeklyItem, deleteWeeklyItem, closeWeeklyPlan, reopenWeeklyPlan } from '../services/weeklyPlan';
import { getStreak, getStreakStatus } from '../services/api';
import { cn } from '../lib/utils';
import { currentWeekId, shiftWeekId, getWeekDates } from '../utils/weekId';
import { toMinutes } from '../components/weekly-plan/timeUtils';
import { toDateKey, todayDateKey } from '../utils/dateKey';
import { buildOverlapMessage, getWeekdayInfoFromDateKey } from '../utils/weekdayLabel';
import { groupItemsByDateKey, hasOverlapForDateKey } from '../utils/weeklyPlanItems';
import { useAuth } from '../context/AuthContext';
import { StatsDock } from '../components/weekly-plan/StatsDock';
import { emitStreakUpdate, traceStreak } from '../utils/streakEvents';

const toTimeString = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const traceOverlap = (trace, label, dateKey) => {
  if (typeof trace !== 'function' || !dateKey) return;
  const info = getWeekdayInfoFromDateKey(dateKey);
  trace('weekday-label', {
    context: label,
    dateKey,
    dayIndex: info.dayIndex,
    label: info.label,
  });
};

export default function WeeklyPlanPage() {
  const [weekId, setWeekId] = useState(currentWeekId());
  const [weekDates, setWeekDates] = useState(getWeekDates(weekId));
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [draftSelection, setDraftSelection] = useState(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [unscheduledDialogOpen, setUnscheduledDialogOpen] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const { user } = useAuth();
  const timezone = user?.timezone || 'Asia/Ho_Chi_Minh';
  const todayKey = useMemo(() => todayDateKey(timezone), [timezone]);
  const [streak, setStreak] = useState(null);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakError, setStreakError] = useState('');
  const [todayStatus, setTodayStatus] = useState(null);
  const [todayStatusLoading, setTodayStatusLoading] = useState(true);
  const [todayStatusError, setTodayStatusError] = useState('');

  const trace = useCallback((label, payload) => {
    if (typeof window === 'undefined') return;
    if (!window.__WEEKLY_PLAN_TRACE__) return;
    console.info(`[weekly-plan] ${label}`, payload);
  }, []);

  const refreshStreak = useCallback(async () => {
    setStreakLoading(true);
    setStreakError('');
    try {
      const { data } = await getStreak();
      setStreak(data);
      emitStreakUpdate(data);
    } catch (err) {
      setStreak(null);
      setStreakError(err?.response?.data?.message || 'Không thể tải chuỗi.');
    } finally {
      setStreakLoading(false);
    }
  }, []);

  const applyStreakUpdate = useCallback((next, meta = {}) => {
    if (!next) return false;
    setStreak((prev) => {
      traceStreak('client-update', {
        context: 'weekly-plan',
        ...meta,
        previous: prev,
        next,
      });
      return next;
    });
    emitStreakUpdate(next);
    return true;
  }, []);

  const applyTodayStatusUpdate = useCallback((status) => {
    if (!status) return;
    setTodayStatus(status);
    setTodayStatusError('');
  }, []);

  const refreshTodayStatus = useCallback(async () => {
    setTodayStatusLoading(true);
    setTodayStatusError('');
    try {
      const { data } = await getStreakStatus(todayKey);
      setTodayStatus(data);
    } catch (err) {
      setTodayStatus(null);
      setTodayStatusError(err?.response?.data?.message || 'Không thể tải trạng thái hôm nay.');
    } finally {
      setTodayStatusLoading(false);
    }
  }, [todayKey]);

  const normalizePlan = useCallback((planData) => {
    if (!planData) return planData;
    const items = (planData.items || []).map((item) => ({
      ...item,
      dateKey: item.dateKey ?? item.allowedDate ?? null,
    }));
    return { ...planData, items };
  }, []);

  const fetchPlan = async (targetWeekId = weekId) => {
    setLoading(true);
    try {
      const { data } = await getWeeklyPlan(targetWeekId);
      setPlan(normalizePlan(data.plan));
      if (data.weekId) {
        setWeekId(data.weekId);
        setWeekDates(getWeekDates(data.weekId));
      }
      trace('fetch-plan', {
        weekId: data.weekId,
        items: (data.plan?.items || []).map((item) => ({
          id: item._id,
          dateKey: item.dateKey ?? item.allowedDate,
          startTime: item.startTime,
          endTime: item.endTime,
        })),
      });
    } catch (err) {
      setStatus({ type: 'error', message: 'Không tải được kế hoạch tuần' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan(weekId);
  }, [weekId]);

  useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  useEffect(() => {
    refreshTodayStatus();
  }, [refreshTodayStatus]);



  const filteredItems = useMemo(() => {
    if (!plan) return [];
    const keyword = search.trim().toLowerCase();
    return (plan.items || []).map((it) => ({
      ...it,
      startTimeMinutes: toMinutes(it.startTime),
      endTimeMinutes: toMinutes(it.endTime),
    })).filter((item) => {
      if (filter === 'done' && !item.completed) return false;
      if (filter === 'todo' && item.completed) return false;
      if (keyword && !item.text.toLowerCase().includes(keyword)) return false;
      return true;
    });
  }, [plan, filter, search]);

  const weekDateKeys = useMemo(
    () => weekDates.map((date) => toDateKey(date, timezone)),
    [weekDates, timezone]
  );

  const dayItems = useMemo(
    () => groupItemsByDateKey(filteredItems, weekDateKeys),
    [filteredItems, weekDateKeys]
  );

  const unscheduledItems = useMemo(() => (
    (plan?.items || []).filter((item) => !item.startTime || !item.endTime)
  ), [plan]);

  const defaultScheduleDayIndex = useMemo(() => {
    const idx = weekDateKeys.indexOf(todayKey);
    return idx >= 0 ? idx : 0;
  }, [weekDateKeys, todayKey]);

  const hasTimeOverlap = useCallback(({ dateKey, startMinutes, endMinutes, excludeId }) => (
    hasOverlapForDateKey(plan?.items || [], dateKey, startMinutes, endMinutes, excludeId)
  ), [plan]);

  const openDialogForRange = ({ dateKey, dayIndex, startMinutes, endMinutes, baseItem }) => {
    const columnDateKey = dateKey || weekDateKeys[dayIndex];
    trace('select-range', {
      weekId,
      dayIndex,
      dateKey: columnDateKey,
      startMinutes,
      endMinutes,
      weekDate: weekDates?.[dayIndex]?.toISOString?.(),
    });
    setDraftSelection({
      weekId,
      dateKey: columnDateKey,
      startTime: toTimeString(startMinutes),
      endTime: toTimeString(endMinutes),
    });
    setEditingItem(baseItem && baseItem._id ? baseItem : null);
    setDialogOpen(true);
  };

  const handleScheduleUnscheduled = (item) => {
    openDialogForRange({
      dayIndex: defaultScheduleDayIndex,
      dateKey: weekDateKeys[defaultScheduleDayIndex],
      startMinutes: 9 * 60,
      endMinutes: 9 * 60 + 30,
      baseItem: item,
    });
  };

  const handleCreateUnscheduled = async (text) => {
    const tempId = `temp-${Date.now()}`;
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [
          ...prev.items,
          {
            _id: tempId,
            text,
            startTime: null,
            endTime: null,
            dateKey: null,
            completed: false,
          },
        ],
      };
    });
    const { data } = await addWeeklyItem({
      weekId,
      text,
    });
    refreshFromResponse(data);
    await fetchPlan();
    setStatus({ type: 'success', message: 'Đã thêm mục chưa sắp xếp' });
  };

  const handleDeleteUnscheduled = async (item) => {
    const confirmed = window.confirm('Xóa mục này?');
    if (!confirmed) return;
    setPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, items: prev.items.filter((it) => it._id !== item._id) };
    });
    const { data } = await deleteWeeklyItem(item._id);
    refreshFromResponse(data);
    await fetchPlan();
    setStatus({ type: 'success', message: 'Đã xóa' });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDraftSelection({
      weekId,
      dateKey: item.dateKey ?? null,
      startTime: item.startTime || '',
      endTime: item.endTime || '',
    });
    setDialogOpen(true);
  };

  const refreshFromResponse = (data) => {
    if (data?.plan) setPlan(normalizePlan(data.plan));
    if (data?.weekId) {
      setWeekId(data.weekId);
      setWeekDates(getWeekDates(data.weekId));
    }
  };

  const handleSaveItem = async (payload) => {
    if (payload.startTime && payload.endTime && payload.endTime < payload.startTime) {
      setStatus({ type: 'error', message: 'Giờ kết thúc phải sau giờ bắt đầu' });
      return;
    }
    if (payload.startTime && payload.endTime) {
      const startMinutes = toMinutes(payload.startTime);
      const endMinutes = toMinutes(payload.endTime);
      const dateKey = (payload.dateKey ?? editingItem?.dateKey) || '';
      if (hasTimeOverlap({ dateKey, startMinutes, endMinutes, excludeId: editingItem?._id })) {
        traceOverlap(trace, 'overlap-client', dateKey);
        throw new Error(buildOverlapMessage({
          dateKey,
          startTime: payload.startTime,
          endTime: payload.endTime,
        }));
      }
    }

    try {
      if (editingItem && editingItem._id) {
        trace('save-item-update', { id: editingItem._id, payload });
        setPlan((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((it) => it._id === editingItem._id ? {
              ...it,
              text: payload.text,
              startTime: payload.startTime ?? null,
              endTime: payload.endTime ?? null,
              dateKey: payload.dateKey ?? it.dateKey ?? null,
            } : it),
          };
        });
        const { data } = await updateWeeklyItem(editingItem._id, {
          text: payload.text,
          startTime: payload.startTime,
          endTime: payload.endTime,
          dateKey: payload.dateKey ?? editingItem.dateKey,
        });
        refreshFromResponse(data);
        setStatus({ type: 'success', message: 'Đã cập nhật' });
      } else if (payload.sourceItemId) {
        trace('save-item-schedule', { id: payload.sourceItemId, payload });
        setPlan((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: prev.items.map((it) => it._id === payload.sourceItemId ? {
              ...it,
              text: payload.text,
              startTime: payload.startTime ?? null,
              endTime: payload.endTime ?? null,
              dateKey: payload.dateKey ?? it.dateKey ?? null,
            } : it),
          };
        });
        const { data } = await updateWeeklyItem(payload.sourceItemId, {
          text: payload.text,
          startTime: payload.startTime,
          endTime: payload.endTime,
          dateKey: payload.dateKey,
        });
        refreshFromResponse(data);
        setStatus({ type: 'success', message: 'Đã đặt lịch' });
      } else {
        trace('save-item-add', { payload: { ...payload, weekId } });
        const tempId = `temp-${Date.now()}`;
        setPlan((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            items: [
              ...prev.items,
              {
                _id: tempId,
                text: payload.text,
                startTime: payload.startTime ?? null,
                endTime: payload.endTime ?? null,
                dateKey: payload.dateKey ?? null,
                completed: false,
              },
            ],
          };
        });
        const { data } = await addWeeklyItem({ ...payload, weekId });
        refreshFromResponse(data);
        setStatus({ type: 'success', message: 'Đã thêm mục' });
      }
      await fetchPlan();
      setEditingItem(null);
      setDraftSelection(null);
    } catch (err) {
      await fetchPlan();
      const statusCode = err?.response?.status;
      const code = err?.response?.data?.code;
      if (statusCode == 409 || code === 'WEEKLY_ITEM_OVERLAP') {
        const dateKey = (payload.dateKey ?? editingItem?.dateKey) || '';
        traceOverlap(trace, 'overlap-server', dateKey);
        throw new Error(buildOverlapMessage({
          dateKey,
          startTime: payload.startTime,
          endTime: payload.endTime,
        }));
      }
      throw new Error(err?.response?.data?.message || 'Không thể lưu mục này.');
    }
  };

  const handleToggle = async (item) => {
    if (!plan?.isClosed) return;
    trace('toggle-item', { id: item._id, completed: !item.completed });
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((it) => it._id === item._id ? { ...it, completed: !it.completed } : it),
      };
    });
    try {
      const { data } = await updateWeeklyItem(item._id, { completed: !item.completed });
      refreshFromResponse(data);
      if (item.dateKey === todayKey) {
        const streakApplied = applyStreakUpdate(data?.streak, { dateKey: todayKey });
        applyTodayStatusUpdate(data?.todayStatus);
        if (!streakApplied) {
          await refreshStreak();
        }
        if (!data?.todayStatus) {
          await refreshTodayStatus();
        }
      }
    } catch (err) {
      fetchPlan();
      await Promise.all([refreshTodayStatus(), refreshStreak()]);
    }
  };

  const handleCloseWeek = async () => {
    const { data } = await closeWeeklyPlan(weekId);
    refreshFromResponse(data);
    setStatus({ type: 'success', message: 'Đã đóng tuần' });
    setCloseDialogOpen(false);
  };

  const handleReopen = async () => {
    const { data } = await reopenWeeklyPlan(weekId);
    refreshFromResponse(data);
    setStatus({ type: 'success', message: 'Đã mở lại tuần' });
  };

  const isClosed = plan?.isClosed;
  const score = plan?.score || 0;

  return (
    <div className="container space-y-4">
      <div className="weekly-plan-card">
        <Card className="p-4 sm:p-5 space-y-3 weeklyPlanBody">
          <div className="weeklyHeaderRow">
            <div className="weeklyHeaderLeft">
              <div className="weeklyHeaderContent space-y-3">
                <WeekToolbar
                  weekId={weekId}
                  weekDates={weekDates}
                  isClosed={!!isClosed}
                  score={score}
                  onPrev={() => setWeekId(shiftWeekId(weekId, -1))}
                  onNext={() => setWeekId(shiftWeekId(weekId, 1))}
                  onToday={() => setWeekId(currentWeekId())}
                  onSelectWeek={(id) => setWeekId(id)}
                  onClose={() => setCloseDialogOpen(true)}
                  onReopen={handleReopen}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <Tabs value={filter} onValueChange={setFilter}>
                    <TabsList>
                      <TabsTrigger value="all">Tất cả</TabsTrigger>
                      <TabsTrigger value="todo">Chưa xong</TabsTrigger>
                      <TabsTrigger value="done">Đã xong</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Input
                    placeholder="Tìm theo nội dung..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {status.message && (
                  <div className={cn(
                    'rounded-md border px-3 py-2 text-sm',
                    status.type === 'error'
                      ? 'border-[var(--red)]/40 text-[var(--red)] bg-[var(--red)]/10'
                      : 'border-[var(--green)]/40 text-[var(--green)] bg-[var(--green)]/10'
                  )}>
                    {status.message}
                  </div>
                )}
              </div>
          </div>

            <div className="weeklyHeaderRight">
              <StatsDock
                streak={streak}
                streakLoading={streakLoading}
                streakError={streakError}
                todayStatus={todayStatus}
                todayStatusLoading={todayStatusLoading}
                todayStatusError={todayStatusError}
                variant="overlay"
                compact
              >
                <UnscheduledList
                  items={unscheduledItems}
                  isClosed={!!isClosed}
                  onAdd={() => setUnscheduledDialogOpen(true)}
                  onDelete={handleDeleteUnscheduled}
                  onSchedule={handleScheduleUnscheduled}
                  className="max-h-72"
                  listClassName="max-h-48 overflow-auto pr-1"
                />
              </StatsDock>
            </div>
          </div>

          <div className="weeklyGridZone">
            {loading ? (
              <div className="space-y-3">
                <div className="skeleton h-6 w-32" />
                <div className="skeleton h-64 w-full" />
              </div>
            ) : (
              <WeekTimeGrid
                weekDateKeys={weekDateKeys}
                dayItems={dayItems}
                isClosed={!!isClosed}
                trace={trace}
                onAddRange={({ dayIndex, startMinutes, endMinutes }) => {
                  openDialogForRange({
                    dayIndex,
                    dateKey: weekDateKeys[dayIndex],
                    startMinutes,
                    endMinutes,
                  });
                }}
                onEditItem={handleEdit}
                onToggleItem={handleToggle}
              />
            )}
          </div>
        </Card>
      </div>

      <WeeklyItemDialog
        open={dialogOpen}
        unscheduledItems={unscheduledItems}
        onOpenChange={(next) => {
          setDialogOpen(next);
          if (!next) {
            setEditingItem(null);
            setDraftSelection(null);
          }
        }}
        initialSelection={draftSelection}
        mode={editingItem ? 'edit' : 'add'}
        item={editingItem || null}
        onSubmit={async (payload) => {
          await handleSaveItem(payload);
        }}
        onDelete={async (item) => {
          const confirmed = window.confirm('Xóa mục này?');
          if (!confirmed) return;
          setPlan((prev) => {
            if (!prev) return prev;
            return { ...prev, items: prev.items.filter((it) => it._id !== item._id) };
          });
          const { data } = await deleteWeeklyItem(item._id);
          refreshFromResponse(data);
          await fetchPlan();
          setStatus({ type: 'success', message: 'Đã xóa' });
          setDialogOpen(false);
          setEditingItem(null);
          setDraftSelection(null);
        }}
      />

      <UnscheduledDialog
        open={unscheduledDialogOpen}
        onOpenChange={setUnscheduledDialogOpen}
        onSubmit={handleCreateUnscheduled}
      />

      <CloseWeekDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        onConfirm={handleCloseWeek}
      />
    </div>
  );
}
