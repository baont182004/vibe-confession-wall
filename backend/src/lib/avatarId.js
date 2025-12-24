export const computeAvatarIdFromId = (id) => {
  const input = String(id || '');
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % 31;
  }
  return (hash % 31) + 1;
};
