import { formatDistanceToNowStrict } from 'date-fns';
import { vi } from 'date-fns/locale';

export const formatRelativeTime = (value) => {
  if (!value) return '';
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 90_000) {
    return 'vừa xong';
  }

  const label = formatDistanceToNowStrict(date, {
    locale: vi,
    roundingMethod: 'floor',
  });

  return `${label} trước`;
};
