import { formatInTimeZone } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';
const DATE_KEY_FORMAT = 'yyyy-MM-dd';
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const normalizeTimezone = (value) => {
  if (typeof value !== 'string') return DEFAULT_TIMEZONE;
  const trimmed = value.trim();
  return trimmed || DEFAULT_TIMEZONE;
};

export const getLocalDateKey = (input = new Date(), timezone) => {
  const date = input instanceof Date ? input : new Date(input);
  const tz = normalizeTimezone(timezone);
  try {
    return formatInTimeZone(date, tz, DATE_KEY_FORMAT);
  } catch {
    return formatInTimeZone(date, DEFAULT_TIMEZONE, DATE_KEY_FORMAT);
  }
};

export const parseDateKeyLocal = (dateKey) => {
  if (typeof dateKey !== 'string' || !DATE_KEY_REGEX.test(dateKey)) return null;
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const toDateKey = (input, timezone) => getLocalDateKey(input, timezone);

export const todayDateKey = (timezone) => getLocalDateKey(new Date(), timezone);
