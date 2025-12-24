import sanitizeHtml from 'sanitize-html';
import WeeklyPlan from '../models/WeeklyPlan.js';
import { resolveWeekId } from '../lib/week.js';
import { getExpectedDayOfWeekFromDateKey, isDateKeyInWeek } from '../lib/weeklyPlanDate.js';
import { getCompletionPolicy } from '../lib/weeklyPlanPolicy.js';
import { getLocalDateKey } from '../lib/dateKey.js';
import { evaluateDailyQualification } from '../services/streakService.js';

const cleanText = (value) => sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} }).trim();

const LOCKED_ERROR = {
  code: 'WEEKLY_PLAN_CLOSED',
  message: 'Weekly plan is closed. Only completion toggles are allowed.',
};

const OPEN_COMPLETION_ERROR = {
  code: 'WEEKLY_PLAN_OPEN',
  message: 'Weekly plan is open. Completion toggles are only allowed after closing.',
};

const INVALID_TIME_ERROR = {
  code: 'WEEKLY_ITEM_INVALID_TIME',
  message: 'Invalid time range. Provide both start and end time.',
};

const OVERLAP_ERROR = {
  code: 'WEEKLY_ITEM_OVERLAP',
  message: 'Time overlaps with another item.',
};

const INVALID_DATE_ERROR = {
  code: 'WEEKLY_ITEM_INVALID_DATE',
  message: 'Allowed date is outside the selected week.',
};

const DAYOFWEEK_INPUT_ERROR = {
  code: 'WEEKLY_ITEM_DAYOFWEEK_FORBIDDEN',
  message: 'dayOfWeek is derived from dateKey and cannot be provided.',
};

const DATEKEY_MISMATCH_ERROR = {
  code: 'WEEKLY_ITEM_DATEKEY_MISMATCH',
  message: 'dateKey and allowedDate must match when both are provided.',
};

const shouldTrace = process.env.WEEKLY_PLAN_TRACE === 'true';
const trace = (label, payload) => {
  if (!shouldTrace) return;
  console.info(`[weekly-plan] ${label}`, payload);
};

const toPlanResponse = (plan) => {
  if (!plan) return plan;
  const plain = typeof plan.toObject === 'function' ? plan.toObject() : plan;
  return {
    ...plain,
    items: (plain.items || []).map((item) => ({
      ...item,
      dateKey: item.allowedDate ?? null,
    })),
  };
};

const respondWithPlan = (res, weekId, plan, status = 200, extras = {}) => {
  const payload = { weekId, plan: toPlanResponse(plan), ...extras };
  if (status && status !== 200) return res.status(status).json(payload);
  return res.json(payload);
};

const ensurePlan = async (userId, weekId) => {
  const existing = await WeeklyPlan.findOne({ userId, weekId });
  if (existing) return existing;
  return WeeklyPlan.create({ userId, weekId, items: [] });
};

const normalizeOptionalString = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return undefined;
};

const toMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
  return h * 60 + m;
};

const validateTimeRange = (startTime, endTime) => {
  const hasStart = typeof startTime === 'string' && startTime.length > 0;
  const hasEnd = typeof endTime === 'string' && endTime.length > 0;
  if (!hasStart && !hasEnd) return { startMinutes: null, endMinutes: null };
  if (!hasStart || !hasEnd) return { error: INVALID_TIME_ERROR };
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);
  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return { error: INVALID_TIME_ERROR };
  }
  return { startMinutes, endMinutes };
};

const hasOverlap = (plan, dateKey, startMinutes, endMinutes, excludeItemId) => {
  if (!dateKey) return false;
  return plan.items.some((it) => {
    if (excludeItemId && String(it._id) === String(excludeItemId)) return false;
    if (it.allowedDate !== dateKey) return false;
    if (!it.startTime || !it.endTime) return false;
    const s = toMinutes(it.startTime);
    const e = toMinutes(it.endTime);
    if (s === null || e === null) return false;
    return startMinutes < e && s < endMinutes;
  });
};

const validateAllowedDate = (allowedDate, weekId) => {
  if (!allowedDate) return null;
  if (!isDateKeyInWeek(allowedDate, weekId)) return INVALID_DATE_ERROR;
  return null;
};

const resolveIncomingDateKey = (body) => {
  if (!body || typeof body !== 'object') return { dateKey: null, hasDateKey: false };
  const hasDateKey = Object.prototype.hasOwnProperty.call(body, 'dateKey')
    || Object.prototype.hasOwnProperty.call(body, 'allowedDate');
  const inputDateKey = Object.prototype.hasOwnProperty.call(body, 'dateKey')
    ? body.dateKey
    : body.allowedDate;
  return {
    dateKey: normalizeOptionalString(inputDateKey) ?? null,
    hasDateKey,
  };
};

const isScheduledItem = (allowedDate, startTime, endTime) =>
  !!allowedDate && !!startTime && !!endTime;

const recomputeScore = (plan) => {
  const total = plan.items.length;
  if (total === 0) return 0;
  const done = plan.items.filter((item) => item.completed).length;
  return Math.round((done / total) * 100);
};

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

const evaluateDateKeys = async (user, dateKeys, todayKey, source) => {
  if (!dateKeys || dateKeys.size === 0) return null;
  const results = await Promise.all(
    Array.from(dateKeys).map(async (dateKey) => {
      try {
        return await evaluateDailyQualification(user._id, dateKey, {
          timezone: user.timezone,
          source,
        });
      } catch (err) {
        console.warn('[streak] plan evaluate failed', err?.message || err);
        return null;
      }
    })
  );
  let todayStatus = null;
  let userStreak = null;
  results.forEach((result) => {
    if (!result) return;
    if (result.userStreak) userStreak = result.userStreak;
    if (result.dailyAchievement && result.dailyAchievement.dateKey === todayKey) {
      todayStatus = result.dailyAchievement;
    }
  });
  return {
    streak: buildStreakPayload(user, userStreak),
    todayStatus: buildStatusPayload(todayStatus, todayKey),
    todayRecorded: !!todayStatus?.awardedAt,
  };
};

export const getWeeklyPlan = async (req, res) => {
  const weekId = resolveWeekId(req.query.weekId);
  const plan = await ensurePlan(req.user._id, weekId);
  return respondWithPlan(res, weekId, plan);
};

export const addWeeklyItem = async (req, res) => {
  const weekId = resolveWeekId(req.body.weekId || req.query.weekId);
  const plan = await ensurePlan(req.user._id, weekId);
  if (plan.isClosed) {
    return res.status(423).json(LOCKED_ERROR);
  }

  const text = cleanText(req.body.text).slice(0, 200);
  const startTime = normalizeOptionalString(req.body.startTime) ?? null;
  const endTime = normalizeOptionalString(req.body.endTime) ?? null;
  const hasDayOfWeek = Object.prototype.hasOwnProperty.call(req.body, 'dayOfWeek');
  if (hasDayOfWeek) {
    return res.status(400).json(DAYOFWEEK_INPUT_ERROR);
  }
  if (
    Object.prototype.hasOwnProperty.call(req.body, 'dateKey')
    && Object.prototype.hasOwnProperty.call(req.body, 'allowedDate')
    && req.body.dateKey !== req.body.allowedDate
  ) {
    return res.status(400).json(DATEKEY_MISMATCH_ERROR);
  }
  const { dateKey } = resolveIncomingDateKey(req.body);

  const timeValidation = validateTimeRange(startTime, endTime);
  if (timeValidation.error) {
    return res.status(400).json(timeValidation.error);
  }
  const expectedDayOfWeek = getExpectedDayOfWeekFromDateKey(dateKey, weekId);
  const resolvedDayOfWeek = expectedDayOfWeek ?? null;

  if (timeValidation.startMinutes !== null) {
    const dateError = validateAllowedDate(dateKey, weekId);
    if (dateError) {
      return res.status(400).json(dateError);
    }
    if (hasOverlap(plan, dateKey, timeValidation.startMinutes, timeValidation.endMinutes)) {
      return res.status(409).json(OVERLAP_ERROR);
    }
  }

  trace('add-item', {
    userId: req.user._id,
    weekId,
    resolvedDayOfWeek,
    dateKey,
    startTime,
    endTime,
  });

  const item = {
    text,
    dayOfWeek: resolvedDayOfWeek,
    startTime,
    endTime,
    allowedDate: dateKey,
    completed: false,
  };

  plan.items.push(item);
  await plan.save();

  return respondWithPlan(res, weekId, plan, 201);
};

export const updateWeeklyItem = async (req, res) => {
  const { itemId } = req.params;
  const plan = await WeeklyPlan.findOne({ userId: req.user._id, 'items._id': itemId });
  if (!plan) return res.status(404).json({ message: 'Item not found' });

  const item = plan.items.id(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const previousCompleted = item.completed;
  const previousAllowedDate = item.allowedDate;
  const previousStartTime = item.startTime;
  const previousEndTime = item.endTime;
  const previousScheduled = isScheduledItem(previousAllowedDate, previousStartTime, previousEndTime);

  const incomingKeys = Object.keys(req.body || {});
  const hasCompletedKey = Object.prototype.hasOwnProperty.call(req.body, 'completed');
  const nonCompletedKeys = incomingKeys.filter((key) => key !== 'completed');
  const completionPolicy = getCompletionPolicy({
    isClosed: plan.isClosed,
    hasCompletedKey,
    nonCompletedKeys,
  });

  trace('update-item', {
    userId: req.user._id,
    itemId,
    weekId: plan.weekId,
    isClosed: plan.isClosed,
    body: req.body,
    completionOnlyAttempt: completionPolicy.completionOnlyAttempt,
  });

  if (plan.isClosed && !completionPolicy.completionOnlyAttempt) {
    return res.status(423).json(LOCKED_ERROR);
  }
  if (!plan.isClosed && hasCompletedKey) {
    return res.status(423).json(OPEN_COMPLETION_ERROR);
  }

  const { text, completed, startTime, endTime, dateKey, allowedDate } = req.body;
  const hasStartTime = Object.prototype.hasOwnProperty.call(req.body, 'startTime');
  const hasEndTime = Object.prototype.hasOwnProperty.call(req.body, 'endTime');
  const hasAllowedDate = Object.prototype.hasOwnProperty.call(req.body, 'allowedDate');
  const hasText = Object.prototype.hasOwnProperty.call(req.body, 'text');
  const hasDayOfWeek = Object.prototype.hasOwnProperty.call(req.body, 'dayOfWeek');
  const hasDateKey = Object.prototype.hasOwnProperty.call(req.body, 'dateKey') || hasAllowedDate;

  if (hasDayOfWeek) {
    return res.status(400).json(DAYOFWEEK_INPUT_ERROR);
  }
  if (
    Object.prototype.hasOwnProperty.call(req.body, 'dateKey')
    && hasAllowedDate
    && dateKey !== allowedDate
  ) {
    return res.status(400).json(DATEKEY_MISMATCH_ERROR);
  }

  if (plan.isClosed && completionPolicy.completionOnlyAttempt) {
    if (typeof completed === 'boolean' && completed !== item.completed) {
      item.completed = completed;
      plan.score = recomputeScore(plan);
      await plan.save();
      if (item.allowedDate) {
        const todayKey = getLocalDateKey(new Date(), req.user.timezone);
        const evaluation = await evaluateDateKeys(
          req.user,
          new Set([item.allowedDate]),
          todayKey,
          'plan:completion-toggle'
        );
        return respondWithPlan(res, plan.weekId, plan, 200, evaluation || {});
      }
    }
    return respondWithPlan(res, plan.weekId, plan);
  }

  const requestedWeekId = req.body.weekId;
  const targetWeekId = requestedWeekId ? resolveWeekId(requestedWeekId) : plan.weekId;
  const isMoving = targetWeekId !== plan.weekId;
  const targetPlan = isMoving ? await ensurePlan(req.user._id, targetWeekId) : plan;
  if (isMoving && targetPlan.isClosed) {
    return res.status(423).json(LOCKED_ERROR);
  }

  const { dateKey: incomingDateKey } = resolveIncomingDateKey(req.body);
  const nextStartTime = hasStartTime ? normalizeOptionalString(startTime) : item.startTime;
  const nextEndTime = hasEndTime ? normalizeOptionalString(endTime) : item.endTime;
  const nextAllowedDate = hasDateKey ? incomingDateKey : item.allowedDate;
  const expectedDayOfWeek = getExpectedDayOfWeekFromDateKey(nextAllowedDate, targetPlan.weekId);
  const nextDayOfWeek = expectedDayOfWeek ?? (hasDateKey ? null : item.dayOfWeek ?? null);

  const shouldValidateTime = hasStartTime || hasEndTime
    || (typeof nextStartTime === 'string' && typeof nextEndTime === 'string');
  const timeValidation = shouldValidateTime
    ? validateTimeRange(nextStartTime, nextEndTime)
    : { startMinutes: null, endMinutes: null };
  if (timeValidation.error) {
    return res.status(400).json(timeValidation.error);
  }
  if (timeValidation.startMinutes !== null) {
    const dateError = validateAllowedDate(nextAllowedDate, targetPlan.weekId);
    if (dateError) {
      return res.status(400).json(dateError);
    }
    if (hasOverlap(targetPlan, nextAllowedDate, timeValidation.startMinutes, timeValidation.endMinutes, itemId)) {
      return res.status(409).json(OVERLAP_ERROR);
    }
  }

  if (!isMoving) {
    if (hasText && typeof text === 'string') item.text = cleanText(text).slice(0, 200);
    if (typeof completed === 'boolean') item.completed = completed;
    if (expectedDayOfWeek !== null) {
      item.dayOfWeek = nextDayOfWeek;
    } else if (hasDateKey) {
      item.dayOfWeek = null;
    }
    if (hasStartTime) item.startTime = nextStartTime ?? null;
    if (hasEndTime) item.endTime = nextEndTime ?? null;
    if (hasDateKey) item.allowedDate = nextAllowedDate ?? null;

    if (typeof completed === 'boolean') {
      plan.score = recomputeScore(plan);
    }
    await plan.save();
    const dateKeysToEvaluate = new Set();
    if (previousCompleted !== item.completed && item.allowedDate) {
      dateKeysToEvaluate.add(item.allowedDate);
    }
    const nextScheduled = isScheduledItem(item.allowedDate, item.startTime, item.endTime);
    if (previousScheduled !== nextScheduled) {
      if (previousAllowedDate) dateKeysToEvaluate.add(previousAllowedDate);
      if (item.allowedDate) dateKeysToEvaluate.add(item.allowedDate);
    }
    if (hasDateKey && previousAllowedDate && previousAllowedDate !== item.allowedDate) {
      dateKeysToEvaluate.add(previousAllowedDate);
    }
    if (hasDateKey && item.allowedDate && item.allowedDate !== previousAllowedDate) {
      dateKeysToEvaluate.add(item.allowedDate);
    }
    const todayKey = getLocalDateKey(new Date(), req.user.timezone);
    const evaluation = await evaluateDateKeys(
      req.user,
      dateKeysToEvaluate,
      todayKey,
      'plan:update'
    );
    return respondWithPlan(res, plan.weekId, plan, 200, evaluation || {});
  }

  const nextText = typeof text === 'string' ? cleanText(text).slice(0, 200) : item.text;
  const nextCompleted = typeof completed === 'boolean' ? completed : item.completed;

  const movedItem = {
    _id: item._id,
    text: nextText,
    dayOfWeek: nextDayOfWeek,
    startTime: nextStartTime ?? null,
    endTime: nextEndTime ?? null,
    allowedDate: nextAllowedDate ?? null,
    completed: nextCompleted,
  };

  item.deleteOne();
  await plan.save();
  targetPlan.items.push(movedItem);
  if (typeof completed === 'boolean') {
    targetPlan.score = recomputeScore(targetPlan);
  }
  await targetPlan.save();
  const dateKeysToEvaluate = new Set();
  const nextScheduled = isScheduledItem(movedItem.allowedDate, movedItem.startTime, movedItem.endTime);
  if (previousScheduled !== nextScheduled) {
    if (previousAllowedDate) dateKeysToEvaluate.add(previousAllowedDate);
    if (movedItem.allowedDate) dateKeysToEvaluate.add(movedItem.allowedDate);
  }
  if (previousAllowedDate && previousAllowedDate !== movedItem.allowedDate) {
    dateKeysToEvaluate.add(previousAllowedDate);
  }
  if (movedItem.allowedDate) {
    if (previousCompleted !== movedItem.completed || previousAllowedDate !== movedItem.allowedDate) {
      dateKeysToEvaluate.add(movedItem.allowedDate);
    }
  }
  const todayKey = getLocalDateKey(new Date(), req.user.timezone);
  const evaluation = await evaluateDateKeys(
    req.user,
    dateKeysToEvaluate,
    todayKey,
    'plan:move'
  );
  return respondWithPlan(res, targetPlan.weekId, targetPlan, 200, evaluation || {});
};

export const deleteWeeklyItem = async (req, res) => {
  const { itemId } = req.params;
  const plan = await WeeklyPlan.findOne({ userId: req.user._id, 'items._id': itemId });
  if (!plan) return res.status(404).json({ message: 'Item not found' });
  if (plan.isClosed) {
    return res.status(423).json(LOCKED_ERROR);
  }

  plan.items.id(itemId)?.deleteOne();
  await plan.save();

  return respondWithPlan(res, plan.weekId, plan);
};

export const closeWeeklyPlan = async (req, res) => {
  const weekId = resolveWeekId(req.body.weekId || req.query.weekId);
  const plan = await ensurePlan(req.user._id, weekId);
  const prevScore = plan.score;
  const nextScore = recomputeScore(plan);
  const wasClosed = plan.isClosed;
  plan.isClosed = true;
  plan.score = nextScore;
  if (!wasClosed || prevScore !== nextScore) {
    await plan.save();
  }

  return respondWithPlan(res, weekId, plan);
};

export const reopenWeeklyPlan = async (req, res) => {
  const weekId = resolveWeekId(req.body.weekId || req.query.weekId);
  const plan = await ensurePlan(req.user._id, weekId);
  plan.isClosed = false;
  await plan.save();
  return respondWithPlan(res, weekId, plan);
};
