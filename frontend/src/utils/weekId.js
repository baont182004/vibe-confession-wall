import { addDays, addWeeks, format, parse, startOfWeek, getISOWeek, getISOWeekYear } from 'date-fns';

const WEEK_FORMAT = "RRRR-'W'II";

export const formatWeekId = (date) => format(startOfWeek(date, { weekStartsOn: 1 }), WEEK_FORMAT);

export const parseWeekId = (weekId) => {
  try {
    return parse(weekId, WEEK_FORMAT, new Date());
  } catch {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }
};

export const shiftWeekId = (weekId, delta) =>
  formatWeekId(addWeeks(startOfWeek(parseWeekId(weekId), { weekStartsOn: 1 }), delta));

export const currentWeekId = () => formatWeekId(new Date());

export const getWeekDates = (weekId) => {
  const start = startOfWeek(parseWeekId(weekId), { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, idx) => addDays(start, idx));
};

export const getWeekRangeFromWeekId = (weekId) => {
  const [start, end] = (() => {
    const s = startOfWeek(parseWeekId(weekId), { weekStartsOn: 1 });
    return [s, addDays(s, 6)];
  })();
  return { startDate: start, endDate: end };
};

const weekLabel = (weekId) => {
  const match = /(\d{4})-W(\d{2})/.exec(weekId);
  const week = match ? Number(match[2]) : '';
  const { startDate, endDate } = getWeekRangeFromWeekId(weekId);
  return `Tuần ${week} (${format(startDate, 'dd/MM/yyyy')} – ${format(endDate, 'dd/MM/yyyy')})`;
};

export const decodeWeekId = (weekId) => {
  const match = /(\d{4})-W(\d{2})/.exec(weekId);
  if (!match) return { year: getISOWeekYear(new Date()), week: getISOWeek(new Date()) };
  return { year: Number(match[1]), week: Number(match[2]) };
};

export const listWeeksNearby = (centerWeekId, past = 8, future = 16) => {
  const weeks = [];
  for (let i = -past; i <= future; i++) {
    const id = shiftWeekId(centerWeekId, i);
    weeks.push({ weekId: id, label: weekLabel(id) });
  }
  return weeks;
};

export const formatWeekSelectorLabel = (weekId) => weekLabel(weekId);
