const STREAK_EVENT = 'streak:update';

export const shouldTraceStreak = () => (
  typeof window !== 'undefined' && window.__STREAK_TRACE__ === true
);

export const traceStreak = (label, payload) => {
  if (!shouldTraceStreak()) return;
  console.info(`[streak] ${label}`, payload);
};

export const emitStreakUpdate = (streak) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STREAK_EVENT, { detail: streak }));
};

export const subscribeStreakUpdate = (handler) => {
  if (typeof window === 'undefined') return () => {};
  const listener = (event) => handler?.(event.detail);
  window.addEventListener(STREAK_EVENT, listener);
  return () => window.removeEventListener(STREAK_EVENT, listener);
};
