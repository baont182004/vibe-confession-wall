import { parseDateKeyLocal } from './dateKey';

const WEEKDAY_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export const getWeekdayInfoFromDateKey = (dateKey) => {
  const date = parseDateKeyLocal(dateKey);
  if (!date) return { label: '', dayIndex: null };
  const dayIndex = date.getDay();
  return {
    dayIndex,
    label: WEEKDAY_LABELS[dayIndex] || '',
  };
};

export const weekdayLabelFromDateKey = (dateKey) => getWeekdayInfoFromDateKey(dateKey).label;

export const weekdayLabelWithDateKey = (dateKey) => {
  const label = weekdayLabelFromDateKey(dateKey);
  if (!label) return dateKey || '';
  return `${label}, ${dateKey}`;
};

export const buildOverlapMessage = ({ dateKey, startTime, endTime }) => {
  const timeLabel = startTime && endTime ? `${startTime}–${endTime}` : '';
  const dateLabel = dateKey ? weekdayLabelWithDateKey(dateKey) : '';
  const parts = [timeLabel, dateLabel].filter(Boolean);
  const detail = parts.length ? ` (${parts.join(', ')})` : '';
  return `Khoảng thời gian bị trùng với công việc khác${detail}.`;
};

