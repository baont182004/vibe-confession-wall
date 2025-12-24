import User from '../models/User.js';

const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

const buildUserPayload = (user) => ({
  _id: user._id,
  nickname: user.nickname,
  avatarId: user.avatarId,
  role: user.role,
  username: user.username,
  timezone: user.timezone || DEFAULT_TIMEZONE,
  profileNote: user.profileNote || '',
});

const normalizeTimezone = (value) => (typeof value === 'string' ? value.trim() : '');

const isValidTimezone = (value) => {
  if (!value) return false;
  try {
    Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
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
    user: buildUserPayload(req.user),
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
    user: buildUserPayload(req.user),
  });
};

export const updateAvatar = async (req, res) => {
  if (Object.prototype.hasOwnProperty.call(req.body, 'avatarUrl')
    || Object.prototype.hasOwnProperty.call(req.body, 'avatarKey')) {
    return res.status(400).json({ message: 'Avatar upload is not supported. Use avatarId only.' });
  }

  const { avatarId } = req.body;
  if (!Number.isInteger(avatarId) || avatarId < 1 || avatarId > 31) {
    return res.status(400).json({ message: 'avatarId must be an integer between 1 and 31.' });
  }

  req.user.avatarId = avatarId;

  await req.user.save();

  res.json({
    user: buildUserPayload(req.user),
  });
};

export const updateProfileNote = async (req, res) => {
  if (typeof req.body?.profileNote !== 'string') {
    return res.status(400).json({ message: 'profileNote must be a string.' });
  }
  const nextNote = req.body.profileNote.trim();
  req.user.profileNote = nextNote;
  await req.user.save();
  res.json({
    user: buildUserPayload(req.user),
  });
};
export const rejectAvatarUpload = (req, res) => {
  res.status(410).json({ message: 'Avatar upload has been removed. Use avatarId only.' });
};

export const updateTimezone = async (req, res) => {
  const timezone = normalizeTimezone(req.body.timezone);
  if (!isValidTimezone(timezone)) {
    return res.status(400).json({
      code: 'INVALID_TIMEZONE',
      message: 'Timezone must be a valid IANA timezone string.',
    });
  }
  req.user.timezone = timezone;
  await req.user.save();
  res.json({
    user: buildUserPayload(req.user),
  });
};
