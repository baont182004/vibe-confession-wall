import { addDays, format, isValid, parse, startOfWeek } from 'date-fns';

const WEEK_FORMAT = "RRRR-'W'II";

export const resolveWeekId = (input) => {
  if (input && typeof input === 'string') return input;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
  return format(weekStart, WEEK_FORMAT);
};

export const createWeekLabel = (weekId) => weekId;

export const parseWeekId = (weekId) => {
  if (!weekId || typeof weekId !== 'string') {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }
  const parsed = parse(weekId, WEEK_FORMAT, new Date());
  if (!isValid(parsed)) {
    return startOfWeek(new Date(), { weekStartsOn: 1 });
  }
  return startOfWeek(parsed, { weekStartsOn: 1 });
};

export const getWeekRange = (weekId) => {
  const start = parseWeekId(weekId);
  const end = addDays(start, 6);
  return { start, end };
};
