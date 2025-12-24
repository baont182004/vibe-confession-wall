import { format, startOfWeek } from 'date-fns';
import DailyAchievement from '../models/DailyAchievement.js';
import JournalEntry from '../models/JournalEntry.js';
import WeeklyPlan from '../models/WeeklyPlan.js';
import User from '../models/User.js';
import { parseDateKeyLocal, shiftDateKey } from '../lib/dateKey.js';
import { validateDateKey } from '../lib/validation.js';

const WEEK_FORMAT = "RRRR-'W'II";

const weekIdFromDateKey = (dateKey) => {
  const base = parseDateKeyLocal(dateKey);
  if (!base) return null;
  const weekStart = startOfWeek(base, { weekStartsOn: 1 });
  return format(weekStart, WEEK_FORMAT);
};

const shouldTrace = process.env.STREAK_TRACE === 'true';
const trace = (label, payload) => {
  if (!shouldTrace) return;
  console.info(`[streak] ${label}`, payload);
};

const computeDayPlanDone = async (userId, dateKey) => {
  const weekId = weekIdFromDateKey(dateKey);
  if (!weekId) return false;
  const plan = await WeeklyPlan.findOne({ userId, weekId }).lean();
  const items = plan?.items || [];
  const scheduled = items.filter((item) => (
    item.allowedDate === dateKey && item.startTime && item.endTime
  ));
  if (scheduled.length === 0) return false;
  return scheduled.every((item) => item.completed === true);
};

const computeHasJournal = async (userId, dateKey) => {
  const entry = await JournalEntry.findOne({ userId, dateKey }).lean();
  if (!entry || typeof entry.content !== 'string') return false;
  return entry.content.trim().length > 0;
};

export const computeNextStreakState = (user, dateKey) => {
  const yesterdayKey = shiftDateKey(dateKey, -1);
  const nextCurrent = user.lastQualifiedDateKey === yesterdayKey
    ? (user.currentStreak || 0) + 1
    : 1;
  const nextBest = Math.max(user.bestStreak || 0, nextCurrent);
  return {
    currentStreak: nextCurrent,
    bestStreak: nextBest,
    lastQualifiedDateKey: dateKey,
  };
};

const updateUserStreak = async (userId, dateKey) => {
  const user = await User.findById(userId);
  if (!user) return null;
  const next = computeNextStreakState(user, dateKey);
  const previous = {
    currentStreak: user.currentStreak || 0,
    bestStreak: user.bestStreak || 0,
    lastQualifiedDateKey: user.lastQualifiedDateKey || null,
  };

  user.currentStreak = next.currentStreak;
  user.bestStreak = next.bestStreak;
  user.lastQualifiedDateKey = next.lastQualifiedDateKey;
  await user.save();
  trace('update-user', {
    userId,
    dateKey,
    previous,
    next,
  });
  return {
    currentStreak: user.currentStreak,
    bestStreak: user.bestStreak,
    lastQualifiedDateKey: user.lastQualifiedDateKey,
  };
};

export const evaluateDailyQualification = async (userId, dateKey, options = {}) => {
  const dateError = validateDateKey(dateKey);
  if (dateError) return null;

  const [hasJournal, dayPlanDone] = await Promise.all([
    computeHasJournal(userId, dateKey),
    computeDayPlanDone(userId, dateKey),
  ]);

  const qualified = hasJournal && dayPlanDone;
  trace('evaluate', {
    userId,
    dateKey,
    timezone: options.timezone,
    source: options.source,
    hasJournal,
    dayPlanDone,
    qualified,
  });

  const dailyAchievement = await DailyAchievement.findOneAndUpdate(
    { userId, dateKey },
    {
      $set: { hasJournal, dayPlanDone, qualified },
      $setOnInsert: { userId, dateKey },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  let userStreak = null;
  let awardedEntry = null;
  if (qualified) {
    const awarded = await DailyAchievement.findOneAndUpdate(
      { userId, dateKey, awardedAt: null, qualified: true },
      { $set: { awardedAt: new Date() } },
      { new: true }
    );
    if (awarded) {
      awardedEntry = awarded;
      userStreak = await updateUserStreak(userId, dateKey);
    }
  }

  const recordedEntry = awardedEntry || dailyAchievement;

  return {
    dailyAchievement: recordedEntry,
    todayRecorded: !!recordedEntry?.awardedAt,
    userStreak,
  };
};
