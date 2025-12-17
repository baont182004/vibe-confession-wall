import fs from 'fs';
import path from 'path';
import User from '../models/User.js';
import { DEFAULT_AVATARS, isDefaultAvatar } from '../lib/avatars.js';

const removeAvatarFile = async (avatarUrl) => {
  if (!avatarUrl || !avatarUrl.startsWith('/uploads/avatars/')) return;
  const relativePath = avatarUrl.replace(/^\//, '');
  const filePath = path.join(process.cwd(), relativePath);
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('Failed to remove avatar file', err.message);
    }
  }
};

export const updateUsername = async (req, res) => {
  const { username } = req.body;
  const normalized = username.trim();
  const lower = normalized.toLowerCase();
  const exists = await User.findOne({ usernameLower: lower }).select('_id');
  if (exists && exists._id.toString() !== req.user._id.toString()) {
    return res.status(409).json({ message: 'Username already taken' });
  }
  req.user.username = normalized;
  req.user.usernameLower = lower;
  await req.user.save();
  res.json({
    user: {
      _id: req.user._id,
      nickname: req.user.nickname,
      avatarId: req.user.avatarId,
      avatarUrl: req.user.avatarUrl,
      role: req.user.role,
      username: req.user.username,
    },
  });
};

export const updateNickname = async (req, res) => {
  const { nickname } = req.body;
  const trimmed = nickname.trim();
  const lower = trimmed.toLowerCase();

  const exists = await User.findOne({ nicknameLower: lower }).select('_id');
  if (exists && exists._id.toString() !== req.user._id.toString()) {
    return res.status(409).json({ message: 'Nickname already taken' });
  }

  req.user.nickname = trimmed;
  req.user.nicknameLower = lower;
  await req.user.save();

  res.json({
    user: {
      _id: req.user._id,
      nickname: req.user.nickname,
      avatarId: req.user.avatarId,
      avatarUrl: req.user.avatarUrl,
      role: req.user.role,
      username: req.user.username,
    },
  });
};

export const updateAvatar = async (req, res) => {
  const { avatarId, avatarUrl, avatarKey } = req.body;
  const parsedKey = avatarKey && Number.isFinite(Number(avatarKey)) ? Number(avatarKey) : null;
  const resolvedAvatarId = avatarId || parsedKey;
  const resolvedAvatarUrl = avatarUrl || (avatarKey && !parsedKey ? avatarKey : null);

  if (!resolvedAvatarId && !resolvedAvatarUrl) {
    return res.status(400).json({ message: 'Avatar selection is required' });
  }

  if (resolvedAvatarId) {
    await removeAvatarFile(req.user.avatarUrl);
    req.user.avatarId = resolvedAvatarId;
    req.user.avatarUrl = null;
  } else if (resolvedAvatarUrl) {
    if (!isDefaultAvatar(resolvedAvatarUrl)) {
      return res.status(400).json({ message: 'Invalid default avatar selection' });
    }
    await removeAvatarFile(req.user.avatarUrl);
    req.user.avatarUrl = resolvedAvatarUrl;
    req.user.avatarId = null;
  }

  await req.user.save();

  res.json({
    user: {
      _id: req.user._id,
      nickname: req.user.nickname,
      avatarId: req.user.avatarId,
      avatarUrl: req.user.avatarUrl,
      role: req.user.role,
      username: req.user.username,
    },
  });
};

export const updateAvatarDefault = async (req, res) => {
  const { avatarUrl } = req.body;
  if (!avatarUrl || !isDefaultAvatar(avatarUrl)) {
    return res.status(400).json({ message: 'Invalid default avatar selection' });
  }

  await removeAvatarFile(req.user.avatarUrl);

  req.user.avatarUrl = avatarUrl;
  req.user.avatarId = null;

  await req.user.save();

  res.json({
    user: {
      _id: req.user._id,
      nickname: req.user.nickname,
      avatarId: req.user.avatarId,
      avatarUrl: req.user.avatarUrl,
      role: req.user.role,
      username: req.user.username,
      updatedAt: req.user.updatedAt,
    },
  });
};


export const uploadAvatar = async (req, res) => {
  const contentType = req.headers['content-type'] || '';

  if (!req.file) {
    console.warn('[avatar] upload missing file', { contentType });
    return res.status(400).json({ message: 'No file received' });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  await removeAvatarFile(req.user.avatarUrl);

  req.user.avatarUrl = avatarUrl;
  req.user.avatarId = null;

  await req.user.save();

  res.json({
    user: {
      _id: req.user._id,
      nickname: req.user.nickname,
      avatarId: req.user.avatarId,
      avatarUrl: req.user.avatarUrl,
      role: req.user.role,
      username: req.user.username,
      updatedAt: req.user.updatedAt,
    },
  });
};

export const getDefaultAvatars = (req, res) => {
  res.json(DEFAULT_AVATARS.map((path, index) => ({
    id: index + 1,
    path,
  })));
};
