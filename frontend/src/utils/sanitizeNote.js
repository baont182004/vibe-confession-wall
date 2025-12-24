const MAX_NOTE_LENGTH = 160;

export const sanitizeNote = (value = '') => {
  const trimmed = value.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= MAX_NOTE_LENGTH) return trimmed;
  return trimmed.slice(0, MAX_NOTE_LENGTH);
};

export const getNoteRemaining = (value = '') => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return Math.max(MAX_NOTE_LENGTH - normalized.length, 0);
};
