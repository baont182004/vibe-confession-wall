import { useEffect, useState } from 'react';
import { getStreak } from '../services/api';
import { subscribeStreakUpdate } from '../utils/streakEvents';

export const useStreak = () => {
  const [streak, setStreak] = useState({ currentStreak: 0, bestStreak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadStreak = async () => {
      setLoading(true);
      try {
        const { data } = await getStreak();
        if (!active) return;
        setStreak({
          currentStreak: data?.currentStreak || 0,
          bestStreak: data?.bestStreak || 0,
        });
      } catch {
        if (!active) return;
        setStreak({ currentStreak: 0, bestStreak: 0 });
      } finally {
        if (active) setLoading(false);
      }
    };
    loadStreak();
    const unsubscribe = subscribeStreakUpdate((next) => {
      if (!next) return;
      setStreak({
        currentStreak: next.currentStreak || 0,
        bestStreak: next.bestStreak || 0,
        lastQualifiedDateKey: next.lastQualifiedDateKey || null,
      });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { streak, loading };
};
