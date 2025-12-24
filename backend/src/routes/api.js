
import express from 'express';
import { requestOTP, verifyOTP, logout, getMe } from '../controllers/authController.js';
import { createPost, getPosts, toggleReaction, updatePost, deletePost } from '../controllers/postController.js';
import { createReport } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  validate,
  emailSchema,
  verifyOtpSchema,
  postSchema,
  reportSchema,
  changeUsernameSchema,
  changeAvatarSchema,
  changeNicknameSchema,
  updateTimezoneSchema,
  addWeeklyItemSchema,
  updateWeeklyItemSchema,
  closeWeeklyPlanSchema,
  updateProfileNoteSchema
} from '../lib/validation.js';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { testEmail } from '../controllers/debugController.js';
import { updateUsername, updateNickname, updateAvatar, rejectAvatarUpload, updateTimezone, updateProfileNote } from '../controllers/userController.js';
import { overview, listPosts as adminListPosts, deletePostAdmin, listComments as adminListComments, deleteCommentAdmin } from '../controllers/adminController.js';
import { createComment, getComments, updateComment, deleteComment, voteComment } from '../controllers/commentController.js';
import { addWeeklyItem, closeWeeklyPlan, deleteWeeklyItem, getWeeklyPlan, reopenWeeklyPlan, updateWeeklyItem } from '../controllers/weeklyPlanController.js';
import journalRoutes from './journalRoutes.js';
import { getStreak, getStreakStatus } from '../controllers/streakController.js';

const router = express.Router();

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Too many login attempts"
});

const postLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX
});

// Auth
router.post('/auth/request-otp', authLimiter, validate(emailSchema), requestOTP);
router.post('/auth/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOTP);
router.post('/auth/logout', logout);
router.get('/auth/me', protect, getMe);
router.post('/debug/email/test', (req, res, next) => {
  if (env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not available in production' });
  }
  next();
}, testEmail);
router.patch('/users/me/username', protect, validate(changeUsernameSchema), updateUsername);
router.patch('/users/me/nickname', protect, validate(changeNicknameSchema), updateNickname);
router.patch('/users/me/avatar', protect, validate(changeAvatarSchema), updateAvatar);
router.post('/users/me/avatar', protect, rejectAvatarUpload);
router.patch('/users/me/timezone', protect, validate(updateTimezoneSchema), updateTimezone);
router.patch('/users/me/profile-note', protect, validate(updateProfileNoteSchema), updateProfileNote);

// Posts
router.get('/posts', protect, getPosts);
router.post('/posts', protect, postLimiter, validate(postSchema), createPost);
router.post('/posts/:id/reactions/:type', protect, toggleReaction);
router.patch('/posts/:id', protect, updatePost);
router.delete('/posts/:id', protect, deletePost);

// Comments
router.post('/posts/:postId/comments', protect, createComment);
router.get('/posts/:postId/comments', protect, getComments);
router.patch('/comments/:id', protect, updateComment);
router.delete('/comments/:id', protect, deleteComment);
router.put('/comments/:id/vote', protect, voteComment);

router.get('/admin/overview', protect, adminOnly, overview);
router.get('/admin/posts', protect, adminOnly, adminListPosts);
router.delete('/admin/posts/:id', protect, adminOnly, deletePostAdmin);
router.get('/admin/comments', protect, adminOnly, adminListComments);
router.delete('/admin/comments/:id', protect, adminOnly, deleteCommentAdmin);

// Weekly Plan
router.get('/weekly-plan', protect, getWeeklyPlan);
router.post('/weekly-plan/items', protect, validate(addWeeklyItemSchema), addWeeklyItem);
router.patch('/weekly-plan/items/:itemId', protect, validate(updateWeeklyItemSchema), updateWeeklyItem);
router.delete('/weekly-plan/items/:itemId', protect, deleteWeeklyItem);
router.post('/weekly-plan/close', protect, validate(closeWeeklyPlanSchema), closeWeeklyPlan);
router.post('/weekly-plan/reopen', protect, validate(closeWeeklyPlanSchema), reopenWeeklyPlan);

// Reporting
router.post('/reports', protect, validate(reportSchema), createReport);

// Journal
router.use('/journal', protect, journalRoutes);

// Streak
router.get('/streak', protect, getStreak);
router.get('/streak/status', protect, getStreakStatus);

// Admin Routes (Skeleton)
router.get('/admin/stats', protect, adminOnly, (req, res) => res.json({ message: "Admin stats" }));

export default router;
