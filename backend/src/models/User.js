
import mongoose from 'mongoose';

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
    default: null,
    select: false,
  },
  avatarId: {
    type: Number,
    default: 1,
  },
  avatarUrl: {
    type: String,
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
    default: null,
    select: false,
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
}, { timestamps: true });

// Index for email and nickname
userSchema.index({ email: 1 });
userSchema.index({ nickname: 1 });
userSchema.index({ nicknameLower: 1 }, { unique: true, sparse: true });
userSchema.index({ usernameLower: 1 }, { unique: true, sparse: true });

export default mongoose.model('User', userSchema);
