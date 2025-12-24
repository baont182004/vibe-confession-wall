import { toMinutes } from '../components/weekly-plan/timeUtils';

const resolveDateKey = (item) => item?.dateKey ?? item?.allowedDate ?? null;

export const groupItemsByDateKey = (items, weekDateKeys) => {
  const grouped = Array.from({ length: 7 }, () => []);
  if (!Array.isArray(items) || !Array.isArray(weekDateKeys)) return grouped;
  const indexByDateKey = new Map(weekDateKeys.map((dateKey, idx) => [dateKey, idx]));
  items.forEach((item) => {
    const dateKey = resolveDateKey(item);
    if (!dateKey) return;
    const idx = indexByDateKey.get(dateKey);
    if (idx === undefined) return;
    grouped[idx].push(item);
  });
  return grouped;
};

export const hasOverlapForDateKey = (items, dateKey, startMinutes, endMinutes, excludeId) => {
  if (!dateKey || startMinutes == null || endMinutes == null) return false;
  if (!Array.isArray(items)) return false;
  return items.some((item) => {
    if (excludeId && String(item._id) === String(excludeId)) return false;
    const itemDateKey = resolveDateKey(item);
    if (itemDateKey !== dateKey) return false;
    if (!item.startTime || !item.endTime) return false;
    const s = toMinutes(item.startTime);
    const e = toMinutes(item.endTime);
    if (s == null || e == null) return false;
    return startMinutes < e && s < endMinutes;
  });
};
