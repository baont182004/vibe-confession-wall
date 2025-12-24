import { differenceInCalendarDays, isValid } from 'date-fns';
import { parseDateKeyLocal } from './dateKey.js';
import { validateDateKey } from './validation.js';
import { getWeekRange } from './week.js';

export const parseDateKey = (dateKey) => parseDateKeyLocal(dateKey) || new Date('');

export const isDateKeyInWeek = (dateKey, weekId) => {
  const error = validateDateKey(dateKey);
  if (error) return false;
  const parsed = parseDateKey(dateKey);
  if (!isValid(parsed)) return false;
  const { start, end } = getWeekRange(weekId);
  return parsed >= start && parsed <= end;
};

export const getExpectedDayOfWeekFromDateKey = (dateKey, weekId) => {
  if (!isDateKeyInWeek(dateKey, weekId)) return null;
  const parsed = parseDateKey(dateKey);
  const { start } = getWeekRange(weekId);
  const diff = differenceInCalendarDays(parsed, start);
  if (diff < 0 || diff > 6) return null;
  return diff + 1; // Monday-based [1..7]
};
