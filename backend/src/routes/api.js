
import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { requestOTP, verifyOTP, logout, getMe } from '../controllers/authController.js';
import { createPost, getPosts, toggleReaction, updatePost, deletePost } from '../controllers/postController.js';
import { getRooms, createRoom, getRoomMessages } from '../controllers/chatController.js';
import { createReport } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { validate, emailSchema, verifyOtpSchema, postSchema, reportSchema, changeUsernameSchema, changeAvatarSchema, changeNicknameSchema, changeAvatarDefaultSchema } from '../lib/validation.js';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { testEmail } from '../controllers/debugController.js';
import { updateUsername, updateNickname, updateAvatar, updateAvatarDefault, uploadAvatar } from '../controllers/userController.js';
import { overview, listPosts as adminListPosts, deletePostAdmin, listComments as adminListComments, deleteCommentAdmin } from '../controllers/adminController.js';
import { createComment, getComments, updateComment, deleteComment, voteComment } from '../controllers/commentController.js';

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

const AVATAR_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars');
const AVATAR_MIME_TYPES = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

const ensureAvatarUploadDir = () => {
  fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
};

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureAvatarUploadDir();
    cb(null, AVATAR_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const extension = AVATAR_MIME_TYPES[file.mimetype];
    const suffix = crypto.randomBytes(16).toString('hex');
    cb(null, `avatar-${req.user._id}-${suffix}${extension}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!AVATAR_MIME_TYPES[file.mimetype]) {
      return cb(new Error('Invalid file type'));
    }
    return cb(null, true);
  },
});

const uploadAvatarMiddleware = (req, res, next) => {
  avatarUpload.single('avatar')(req, res, (err) => {
    if (err) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({ message: err.message });
    }
    return next();
  });
};

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
router.patch('/users/me/avatar-default', protect, validate(changeAvatarDefaultSchema), updateAvatarDefault);
router.post('/users/me/avatar', protect, uploadAvatarMiddleware, uploadAvatar);

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

// Chat
router.get('/chat/rooms', protect, getRooms);
router.post('/chat/rooms', protect, adminOnly, createRoom);
router.get('/chat/rooms/:roomId/messages', protect, getRoomMessages);

// Reporting
router.post('/reports', protect, validate(reportSchema), createReport);

// Admin Routes (Skeleton)
router.get('/admin/stats', protect, adminOnly, (req, res) => res.json({ message: "Admin stats" }));

// Avatars Meta
router.get('/meta/avatars', (req, res) => {
  const avatars = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    path: `/assets/avatars/avatar-${String(i + 1).padStart(2, '0')}.svg`,
  }));
  res.json(avatars);
});

export default router;
