import DailyAchievement from '../models/DailyAchievement.js';
import { validateDateKey } from '../lib/validation.js';

export const getStreak = (req, res) => {
  res.json({
    currentStreak: req.user.currentStreak || 0,
    bestStreak: req.user.bestStreak || 0,
    lastQualifiedDateKey: req.user.lastQualifiedDateKey || null,
  });
};

export const getStreakStatus = async (req, res) => {
  const dateKey = req.query.date || req.query.dateKey || '';
  const dateError = validateDateKey(dateKey);
  if (dateError) {
    return res.status(400).json(dateError);
  }
  const entry = await DailyAchievement.findOne({ userId: req.user._id, dateKey }).lean();
  if (!entry) {
    return res.json({
      dateKey,
      hasJournal: false,
      dayPlanDone: false,
      qualified: false,
      awardedAt: null,
    });
  }
  return res.json({
    dateKey,
    hasJournal: entry.hasJournal,
    dayPlanDone: entry.dayPlanDone,
    qualified: entry.qualified,
    awardedAt: entry.awardedAt,
  });
};
