import { addDays, format, parse } from 'date-fns';
import { vi } from 'date-fns/locale';

const DATE_KEY_FORMAT = 'yyyy-MM-dd';

export const parseDateKey = (dateKey) => parse(dateKey, DATE_KEY_FORMAT, new Date());

export const formatDateKey = (date) => format(date, DATE_KEY_FORMAT);

export const shiftDateKey = (dateKey, delta) => formatDateKey(addDays(parseDateKey(dateKey), delta));

export const formatDateDisplay = (dateKey) => format(parseDateKey(dateKey), 'EEEE, dd/MM/yyyy', { locale: vi });

export const formatDateShort = (dateKey) => format(parseDateKey(dateKey), 'dd/MM', { locale: vi });

export const formatTimeShort = (value) => {
  if (!value) return '';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';
  return format(date, 'HH:mm');
};
