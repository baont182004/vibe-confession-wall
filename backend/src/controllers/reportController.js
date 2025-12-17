
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import ChatMessage from '../models/ChatMessage.js';
import { env } from '../config/env.js';

export const createReport = async (req, res) => {
  const { targetType, targetId, reason } = req.body;
  const THRESHOLD = env.REPORT_THRESHOLD;

  let TargetModel;
  switch (targetType) {
    case 'Post': TargetModel = Post; break;
    case 'Comment': TargetModel = Comment; break;
    case 'ChatMessage': TargetModel = ChatMessage; break;
    default: return res.status(400).json({ message: 'Invalid target type' });
  }

  const target = await TargetModel.findById(targetId);
  if (!target) return res.status(404).json({ message: 'Target not found' });

  // Increment internal report count (requires schema update for each model to have reportCount)
  // Assumes we added reportCount to schemas
  target.reportCount = (target.reportCount || 0) + 1;

  if (target.reportCount >= THRESHOLD) {
    target.status = 'hidden';
  }

  await target.save();

  // In a real app, create a Report record here for admin review
  
  res.status(201).json({ message: 'Report submitted' });
};
