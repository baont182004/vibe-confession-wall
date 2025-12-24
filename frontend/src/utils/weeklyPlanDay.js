export const getDayIndex = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  if (value >= 1 && value <= 7) return value - 1;
  if (value >= 0 && value <= 6) return value;
  return null;
};
