import { addDays, format, isValid, parse } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { validateDateKey } from './validation.js';

const DATE_KEY_FORMAT = 'yyyy-MM-dd';
export const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

export const normalizeTimezone = (value) => {
  if (typeof value !== 'string') return DEFAULT_TIMEZONE;
  const trimmed = value.trim();
  return trimmed || DEFAULT_TIMEZONE;
};

export const getLocalDateKey = (date = new Date(), timezone) => {
  const tz = normalizeTimezone(timezone);
  try {
    return formatInTimeZone(date, tz, DATE_KEY_FORMAT);
  } catch {
    return formatInTimeZone(date, DEFAULT_TIMEZONE, DATE_KEY_FORMAT);
  }
};

export const parseDateKeyLocal = (dateKey) => {
  const error = validateDateKey(dateKey);
  if (error) return null;
  const parsed = parse(dateKey, DATE_KEY_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
};

export const shiftDateKey = (dateKey, delta) => {
  const parsed = parseDateKeyLocal(dateKey);
  if (!parsed) return dateKey;
  return format(addDays(parsed, delta), DATE_KEY_FORMAT);
};
