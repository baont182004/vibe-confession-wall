export const START_MINUTES = 7 * 60;
export const END_MINUTES = 24 * 60; // hiển thị đến 24:00
export const STEP_MINUTES = 30;
export const PX_PER_MIN = 1; // chiều cao ổn định hơn, tránh co hẹp quá mức
export const ROW_HEIGHT = STEP_MINUTES * PX_PER_MIN;
export const HOUR_HEIGHT = 60 * PX_PER_MIN;
export const TIME_COL_WIDTH = 64; // px
export const DAY_COL_WIDTH = 170; // px cố định cho mỗi cột ngày
export const GRID_HEIGHT_PX = (END_MINUTES - START_MINUTES) * PX_PER_MIN;

export const toMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

export const minutesToLabel = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const snapMinutes = (mins, step = STEP_MINUTES) =>
  Math.max(START_MINUTES, Math.min(END_MINUTES, Math.round(mins / step) * step));

export const rangeToStyle = (startMinutes, endMinutes) => {
  const safeStart = Math.max(START_MINUTES, startMinutes ?? START_MINUTES);
  const safeEnd = Math.min(END_MINUTES, endMinutes ?? END_MINUTES);
  const top = (safeStart - START_MINUTES) * PX_PER_MIN;
  const height = Math.max((safeEnd - safeStart) * PX_PER_MIN, STEP_MINUTES * PX_PER_MIN);
  return { top, height };
};
