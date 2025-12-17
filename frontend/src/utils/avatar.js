import { API_ORIGIN } from '../services/api';

export const DEFAULT_AVATARS = [
  { id: 1, src: '/assets/avatars/avatar-01.svg', label: 'Comet' },
  { id: 2, src: '/assets/avatars/avatar-02.svg', label: 'Wave' },
  { id: 3, src: '/assets/avatars/avatar-03.svg', label: 'Orbit' },
  { id: 4, src: '/assets/avatars/avatar-04.svg', label: 'Nova' },
  { id: 5, src: '/assets/avatars/avatar-05.svg', label: 'Bloom' },
  { id: 6, src: '/assets/avatars/avatar-06.svg', label: 'Pulse' },
  { id: 7, src: '/assets/avatars/avatar-07.svg', label: 'Echo' },
  { id: 8, src: '/assets/avatars/avatar-08.svg', label: 'Drift' },
];

const hashString = (value) => {
  let hash = 0;
  if (!value) return hash;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

export const getDefaultAvatarById = (id) => {
  const numeric = Number(id);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return DEFAULT_AVATARS[0].src;
  }
  const index = (numeric - 1) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index].src;
};

export const getDefaultAvatar = (seed) => {
  const key = typeof seed === 'string'
    ? seed
    : seed?._id || seed?.nickname || '';
  const index = Math.abs(hashString(key)) % DEFAULT_AVATARS.length;
  return DEFAULT_AVATARS[index].src;
};

const resolveAvatarUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    return `${API_ORIGIN}${url}`;
  }
  return url;
};

export const getAvatarSrc = (user, overrideSrc) => {
  if (!user && overrideSrc) return overrideSrc;
  const avatarUrl = typeof user?.avatarUrl === 'string' ? user.avatarUrl.trim() : '';
  if (avatarUrl) return resolveAvatarUrl(avatarUrl);
  if (user?.avatarId) return getDefaultAvatarById(user.avatarId);
  if (overrideSrc) return overrideSrc;
  return getDefaultAvatar(user);
};
