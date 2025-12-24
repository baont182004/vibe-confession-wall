import JournalEntry from '../models/JournalEntry.js';
import { validateDateKey, validateJournalContent } from '../lib/validation.js';
import { evaluateDailyQualification } from '../services/streakService.js';

const MAX_CONTENT_LENGTH = 10000;

const buildStatusPayload = (entry, dateKey) => {
  if (!entry) return null;
  return {
    dateKey: entry.dateKey || dateKey,
    hasJournal: entry.hasJournal,
    dayPlanDone: entry.dayPlanDone,
    qualified: entry.qualified,
    awardedAt: entry.awardedAt,
  };
};

const buildStreakPayload = (user, userStreak) => (
  userStreak || {
    currentStreak: user?.currentStreak || 0,
    bestStreak: user?.bestStreak || 0,
    lastQualifiedDateKey: user?.lastQualifiedDateKey || null,
  }
);

const formatEntry = (entry) => ({
  id: entry._id,
  dateKey: entry.dateKey,
  content: entry.content,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});

const getDateKeyFromQuery = (req) => req.query.date || req.query.dateKey || '';

export const getJournalByDate = async (req, res) => {
  const dateKey = getDateKeyFromQuery(req);
  const dateError = validateDateKey(dateKey);
  if (dateError) {
    return res.status(400).json(dateError);
  }

  const entry = await JournalEntry.findOne({
    userId: req.user._id,
    dateKey,
  });

  if (!entry) {
    return res.json({ entry: null });
  }

  return res.json({ entry: formatEntry(entry) });
};

export const upsertJournal = async (req, res) => {
  const dateKey = req.body?.dateKey || '';
  const dateError = validateDateKey(dateKey);
  if (dateError) {
    return res.status(400).json(dateError);
  }

  const contentError = validateJournalContent(req.body?.content, MAX_CONTENT_LENGTH);
  if (contentError) {
    return res.status(400).json(contentError);
  }
  const content = req.body.content.trim();

  const result = await JournalEntry.findOneAndUpdate(
    { userId: req.user._id, dateKey },
    {
      $set: { content },
      $setOnInsert: { userId: req.user._id, dateKey },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      rawResult: true,
    }
  );

  const entry = result?.value;
  const created = result?.lastErrorObject ? !result.lastErrorObject.updatedExisting : false;
  const status = created ? 201 : 200;
  let evaluation = null;
  try {
    evaluation = await evaluateDailyQualification(req.user._id, dateKey, {
      timezone: req.user.timezone,
      source: 'journal:upsert',
    });
  } catch (err) {
    console.warn('[streak] journal upsert evaluate failed', err?.message || err);
  }
  return res.status(status).json({
    entry: formatEntry(entry),
    created,
    streak: buildStreakPayload(req.user, evaluation?.userStreak),
    todayStatus: buildStatusPayload(evaluation?.dailyAchievement, dateKey),
    todayRecorded: !!evaluation?.dailyAchievement?.awardedAt,
  });
};

export const deleteJournalByDate = async (req, res) => {
  const dateKey = getDateKeyFromQuery(req);
  const dateError = validateDateKey(dateKey);
  if (dateError) {
    return res.status(400).json(dateError);
  }

  await JournalEntry.deleteOne({ userId: req.user._id, dateKey });
  let evaluation = null;
  try {
    evaluation = await evaluateDailyQualification(req.user._id, dateKey, {
      timezone: req.user.timezone,
      source: 'journal:delete',
    });
  } catch (err) {
    console.warn('[streak] journal delete evaluate failed', err?.message || err);
  }
  return res.json({
    ok: true,
    streak: buildStreakPayload(req.user, evaluation?.userStreak),
    todayStatus: buildStatusPayload(evaluation?.dailyAchievement, dateKey),
    todayRecorded: !!evaluation?.dailyAchievement?.awardedAt,
  });
};
