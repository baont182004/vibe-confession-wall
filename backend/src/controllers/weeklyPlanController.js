import sanitizeHtml from 'sanitize-html';
import WeeklyPlan from '../models/WeeklyPlan.js';
import { resolveWeekId } from '../lib/week.js';

const cleanText = (value) => sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} }).trim();

const ensurePlan = async (userId, weekId) => {
  const existing = await WeeklyPlan.findOne({ userId, weekId });
  if (existing) return existing;
  return WeeklyPlan.create({ userId, weekId, items: [] });
};

export const getWeeklyPlan = async (req, res) => {
  const weekId = resolveWeekId(req.query.weekId);
  const plan = await ensurePlan(req.user._id, weekId);
  res.json({ weekId, plan });
};

export const addWeeklyItem = async (req, res) => {
  const weekId = resolveWeekId(req.body.weekId || req.query.weekId);
  const plan = await ensurePlan(req.user._id, weekId);

  const text = cleanText(req.body.text).slice(0, 200);

  const item = {
    text,
    dayOfWeek: req.body.dayOfWeek,
    startTime: req.body.startTime || null,
    endTime: req.body.endTime || null,
    allowedDate: req.body.allowedDate || null,
    completed: false,
  };

  plan.items.push(item);
  await plan.save();

  res.status(201).json({ weekId, plan });
};

export const updateWeeklyItem = async (req, res) => {
  const { itemId } = req.params;
  const plan = await WeeklyPlan.findOne({ userId: req.user._id, 'items._id': itemId });
  if (!plan) return res.status(404).json({ message: 'Item not found' });

  const item = plan.items.id(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });

  const { text, completed, dayOfWeek, startTime, endTime, allowedDate } = req.body;

  if (typeof text === 'string') item.text = cleanText(text).slice(0, 200);
  if (typeof completed === 'boolean') item.completed = completed;
  if (typeof dayOfWeek === 'number') item.dayOfWeek = dayOfWeek;
  if (typeof startTime === 'string' || startTime === null) item.startTime = startTime;
  if (typeof endTime === 'string' || endTime === null) item.endTime = endTime;
  if (typeof allowedDate === 'string' || allowedDate === null) item.allowedDate = allowedDate;

  await plan.save();
  res.json({ weekId: plan.weekId, plan });
};

export const deleteWeeklyItem = async (req, res) => {
  const { itemId } = req.params;
  const plan = await WeeklyPlan.findOne({ userId: req.user._id, 'items._id': itemId });
  if (!plan) return res.status(404).json({ message: 'Item not found' });

  plan.items.id(itemId)?.deleteOne();
  await plan.save();

  res.json({ weekId: plan.weekId, plan });
};

export const closeWeeklyPlan = async (req, res) => {
  const weekId = resolveWeekId(req.body.weekId || req.query.weekId);
  const plan = await ensurePlan(req.user._id, weekId);

  const total = plan.items.length;
  const done = plan.items.filter(i => i.completed).length;
  plan.isClosed = true;
  plan.score = total === 0 ? 0 : Math.round((done / total) * 100);
  await plan.save();

  res.json({ weekId, plan });
};

export const reopenWeeklyPlan = async (req, res) => {
  const weekId = resolveWeekId(req.body.weekId || req.query.weekId);
  const plan = await ensurePlan(req.user._id, weekId);
  plan.isClosed = false;
  await plan.save();
  res.json({ weekId, plan });
};
