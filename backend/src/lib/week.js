import { startOfWeek, format } from 'date-fns';

export const resolveWeekId = (input) => {
  if (input && typeof input === 'string') return input;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
  return format(weekStart, "yyyy-'W'II");
};

export const createWeekLabel = (weekId) => weekId;
