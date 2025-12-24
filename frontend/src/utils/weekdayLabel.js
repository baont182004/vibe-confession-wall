import { parseDateKeyLocal } from './dateKey';

const WEEKDAY_LABELS = ['Ch? nh?t', 'Th? 2', 'Th? 3', 'Th? 4', 'Th? 5', 'Th? 6', 'Th? 7'];

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

