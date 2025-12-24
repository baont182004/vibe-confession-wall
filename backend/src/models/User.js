
import mongoose from 'mongoose';
import { computeAvatarIdFromId } from '../lib/avatarId.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    select: false, // Never return email by default
  },
  nickname: {
    type: String,
    unique: true,
    required: true,
  },
  nicknameLower: {
    type: String,
    unique: true,
    sparse: true,
    // Không lưu null để không bị đụng unique index
    set: (v) => (v ? v : undefined),
    select: false,
  },
  avatarId: {
    type: Number,
    min: 1,
    max: 31,
    default: null,
  },
  username: {
    type: String,
    trim: true,
    default: null,
  },
  usernameLower: {
    type: String,
    unique: true,
    sparse: true,
    select: false,
    set: (v) => (v ? v : undefined),
  },
  timezone: {
    type: String,
    default: 'Asia/Ho_Chi_Minh',
  },
  profileNote: {
    type: String,
    default: '',
    trim: true,
    maxlength: 160,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  otpHash: {
    type: String,
    select: false,
  },
  otpExpires: {
    type: Date,
    select: false,
  },
  bannedUntil: {
    type: Date,
    default: null,
  },
  otpLastRequestedAt: {
    type: Date,
    default: null,
    select: false,
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active',
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  bestStreak: {
    type: Number,
    default: 0,
  },
  lastQualifiedDateKey: {
    type: String,
    default: null,
  },
}, { timestamps: true });

// Index for email and nickname
userSchema.index({ email: 1 });
userSchema.index({ nickname: 1 });
userSchema.index({ nicknameLower: 1 }, { unique: true, sparse: true });
userSchema.index({ usernameLower: 1 }, { unique: true, sparse: true });

userSchema.pre('validate', function assignAvatarId(next) {
  if (!this.avatarId || this.avatarId < 1 || this.avatarId > 31) {
    this.avatarId = computeAvatarIdFromId(this._id);
  }
  next();
});

export default mongoose.model('User', userSchema);
