const NICKNAME_MIN = 3;
const NICKNAME_MAX = 20;
const NICKNAME_REGEX = /^[A-Za-z0-9_]+$/;

export const validateNickname = (value) => {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { valid: false, message: 'Biệt danh không được để trống.' };
  }
  if (trimmed.length < NICKNAME_MIN || trimmed.length > NICKNAME_MAX) {
    return { valid: false, message: `Biệt danh phải từ ${NICKNAME_MIN}-${NICKNAME_MAX} ký tự.` };
  }
  if (!NICKNAME_REGEX.test(trimmed)) {
    return { valid: false, message: 'Biệt danh chỉ gồm chữ, số và dấu gạch dưới (_).' };
  }
  return { valid: true, message: '' };
};
