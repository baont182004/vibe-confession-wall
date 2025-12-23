import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { WeekToolbar } from '../components/weekly-plan/WeekToolbar';
import { WeeklyItemDialog } from '../components/weekly-plan/WeeklyItemDialog';
import { CloseWeekDialog } from '../components/weekly-plan/CloseWeekDialog';
import { WeekTimeGrid } from '../components/weekly-plan/WeekTimeGrid';
import { getWeeklyPlan, addWeeklyItem, updateWeeklyItem, deleteWeeklyItem, closeWeeklyPlan, reopenWeeklyPlan } from '../services/weeklyPlan';
import { cn } from '../lib/utils';
import { currentWeekId, shiftWeekId, getWeekDates } from '../utils/weekId';
import { toMinutes } from '../components/weekly-plan/timeUtils';

const toTimeString = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchPlan = async (targetWeekId = weekId) => {
    setLoading(true);
    try {
      const { data } = await getWeeklyPlan(targetWeekId);
      setPlan(data.plan);
      if (data.weekId) {
        setWeekId(data.weekId);
        setWeekDates(getWeekDates(data.weekId));
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Không tải được kế hoạch tuần' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan(weekId);
  }, [weekId]);

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

  const dayItems = useMemo(() => {
    const grouped = Array.from({ length: 7 }, () => []);
    filteredItems.forEach((item) => {
      const idx = typeof item.dayOfWeek === 'number' ? item.dayOfWeek : 0;
      if (grouped[idx]) grouped[idx].push(item);
    });
    return grouped;
  }, [filteredItems]);

  const openDialogForRange = ({ dayIndex, startMinutes, endMinutes, baseItem }) => {
    const allowed = weekDates[dayIndex]?.toISOString().slice(0, 10);
    setDraftSelection({
      weekId,
      dayOfWeek: dayIndex,
      allowedDate: allowed,
      startTime: toTimeString(startMinutes),
      endTime: toTimeString(endMinutes),
    });
    setEditingItem(baseItem && baseItem._id ? baseItem : null);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setDraftSelection({
      weekId,
      dayOfWeek: item.dayOfWeek ?? 0,
      allowedDate: item.allowedDate,
      startTime: item.startTime || '',
      endTime: item.endTime || '',
    });
    setDialogOpen(true);
  };

  const refreshFromResponse = (data) => {
    if (data?.plan) setPlan(data.plan);
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
    if (editingItem && editingItem._id) {
      const { data } = await updateWeeklyItem(editingItem._id, {
        text: payload.text,
        startTime: payload.startTime,
        endTime: payload.endTime,
        dayOfWeek: payload.dayOfWeek ?? editingItem.dayOfWeek,
        allowedDate: payload.allowedDate ?? editingItem.allowedDate,
      });
      refreshFromResponse(data);
      setStatus({ type: 'success', message: 'Đã cập nhật' });
    } else {
      const { data } = await addWeeklyItem({ ...payload, weekId });
      refreshFromResponse(data);
      setStatus({ type: 'success', message: 'Đã thêm mục' });
    }
    setEditingItem(null);
    setDraftSelection(null);
  };

  const handleMoveItem = async (itemWithMinutes) => {
    if (!itemWithMinutes._id) return;
    const startTime = toTimeString(itemWithMinutes.startTimeMinutes);
    const endTime = toTimeString(itemWithMinutes.endTimeMinutes);
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((it) => it._id === itemWithMinutes._id
          ? { ...it, startTime, endTime, dayOfWeek: itemWithMinutes.dayOfWeek ?? it.dayOfWeek }
          : it),
      };
    });
    try {
      const { data } = await updateWeeklyItem(itemWithMinutes._id, {
        dayOfWeek: itemWithMinutes.dayOfWeek,
        startTime,
        endTime,
        allowedDate: weekDates[itemWithMinutes.dayOfWeek]?.toISOString().slice(0, 10),
      });
      refreshFromResponse(data);
    } catch (err) {
      fetchPlan();
    }
  };

  const handleToggle = async (item) => {
    if (plan?.isClosed) return;
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
    } catch (err) {
      fetchPlan();
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
      <Card className="p-4 sm:p-5 space-y-3">
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

        {loading ? (
          <div className="space-y-3">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-64 w-full" />
          </div>
        ) : (
          <WeekTimeGrid
            weekDates={weekDates}
            dayItems={dayItems}
            isClosed={!!isClosed}
            onAddRange={({ dayIndex, startMinutes, endMinutes }) => {
              openDialogForRange({ dayIndex, startMinutes, endMinutes });
            }}
            onEditItem={handleEdit}
            onToggleItem={handleToggle}
            onMoveItem={(item) => handleMoveItem({ ...item, dayOfWeek: item.dayOfWeek ?? item.dayIndex ?? 0 })}
            onAddUnscheduled={(item) => {
              openDialogForRange({
                dayIndex: item.dayOfWeek ?? 0,
                startMinutes: 9 * 60,
                endMinutes: 9 * 60 + 30,
                baseItem: item,
              });
            }}
          />
        )}
      </Card>

      <WeeklyItemDialog
        open={dialogOpen}
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
          const { data } = await deleteWeeklyItem(item._id);
          refreshFromResponse(data);
          setStatus({ type: 'success', message: 'Đã xóa' });
          setDialogOpen(false);
          setEditingItem(null);
          setDraftSelection(null);
        }}
      />

      <CloseWeekDialog
        open={closeDialogOpen}
        onOpenChange={setCloseDialogOpen}
        onConfirm={handleCloseWeek}
      />
    </div>
  );
}
