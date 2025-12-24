import { useState, useMemo, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { getAvatarSrc, getDefaultAvatar } from '../../utils/avatar';

export const Avatar = ({ user, src, size = 40, alt, className, style, ...props }) => {
  const fallbackSrc = useMemo(() => getDefaultAvatar(user), [user]);
  const [errored, setErrored] = useState(false);
  const rawSrc = getAvatarSrc(user, src);
  const resolvedSrc = useMemo(() => {
    if (errored) return fallbackSrc;
    if (!rawSrc) return fallbackSrc;
    return rawSrc;
  }, [errored, fallbackSrc, rawSrc]);
  const resolvedAlt = alt || (user?.nickname ? `${user.nickname} avatar` : 'avatar');

  useEffect(() => {
    setErrored(false);
  }, [rawSrc]);

  return (
    <img
      src={resolvedSrc}
      alt={resolvedAlt}
      className={cn('avatar rounded-full border border-[var(--border)] bg-[var(--surface2)] object-cover', className)}
      style={{ width: size, height: size, ...style }}
      onError={() => setErrored(true)}
      {...props}
    />
  );
};
