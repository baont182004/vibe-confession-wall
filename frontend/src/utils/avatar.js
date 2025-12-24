const DEFAULT_AVATAR_COUNT = 31;

const pad2 = (value) => String(value).padStart(2, '0');

export const getDefaultAvatarById = (id) => {
  const numeric = Number(id);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '/avatars/avatar-01.png';
  }
  const normalized = ((Math.floor(numeric) - 1) % DEFAULT_AVATAR_COUNT) + 1;
  return `/avatars/avatar-${pad2(normalized)}.png`;
};

const hashString = (value) => {
  let hash = 0;
  if (!value) return hash;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

export const getDefaultAvatar = (seed) => {
  const key = typeof seed === 'string'
    ? seed
    : seed?._id || seed?.nickname || '';
  const index = Math.abs(hashString(key)) % DEFAULT_AVATAR_COUNT;
  return getDefaultAvatarById(index + 1);
};

export const getAvatarSrc = (user, overrideSrc) => {
  if (!user && overrideSrc) return overrideSrc;
  if (user?.avatarId) return getDefaultAvatarById(user.avatarId);
  if (overrideSrc) return overrideSrc;
  return getDefaultAvatar(user);
};
