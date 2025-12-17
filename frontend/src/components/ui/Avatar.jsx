import { useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { getAvatarSrc, getDefaultAvatar } from '../../utils/avatar';

export const Avatar = ({ user, src, size = 40, alt, className, style, ...props }) => {
  const fallbackSrc = useMemo(() => getDefaultAvatar(user), [user]);
  const [errored, setErrored] = useState(false);
  const [cacheKey, setCacheKey] = useState(null);
  const rawSrc = getAvatarSrc(user, src);
  const isUploaded = rawSrc && rawSrc.includes('/uploads/avatars/');
  const resolvedSrc = useMemo(() => {
    if (errored) return fallbackSrc;
    if (!rawSrc) return fallbackSrc;
    if (!isUploaded || !cacheKey) return rawSrc;
    const separator = rawSrc.includes('?') ? '&' : '?';
    return `${rawSrc}${separator}v=${cacheKey}`;
  }, [errored, fallbackSrc, rawSrc, isUploaded, cacheKey]);
  const resolvedAlt = alt || (user?.nickname ? `${user.nickname} avatar` : 'avatar');

  useEffect(() => {
    setErrored(false);
  }, [rawSrc]);

  useEffect(() => {
    if (isUploaded) {
      setCacheKey(user?.updatedAt || Date.now());
    } else {
      setCacheKey(null);
    }
  }, [isUploaded, rawSrc, user?.updatedAt]);

  return (
    <img
      src={resolvedSrc}
      alt={resolvedAlt}
      className={clsx('avatar', className)}
      style={{ width: size, height: size, ...style }}
      onError={() => setErrored(true)}
      {...props}
    />
  );
};
