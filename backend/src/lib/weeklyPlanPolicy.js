export const getCompletionPolicy = ({ isClosed, hasCompletedKey, nonCompletedKeys }) => {
  const completionOnlyAttempt = hasCompletedKey && nonCompletedKeys.length === 0;
  return {
    completionOnlyAttempt,
    allowCompletionToggle: isClosed && completionOnlyAttempt,
    allowMutation: !isClosed && !hasCompletedKey,
  };
};
