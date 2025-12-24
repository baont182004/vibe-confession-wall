
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import logger from '../lib/logger.js';
import { env } from '../config/env.js';
import { createTransporter } from '../config/email.js';

const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendEmail = async (to, subject, text, correlationId) => {
  const start = Date.now();
  const transporter = createTransporter();
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      text,
    });
    const duration = Date.now() - start;
    logger.info(JSON.stringify({
      event: 'email_sent',
      correlationId,
      to,
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE || env.SMTP_PORT === 465,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      durationMs: duration
    }));
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return { info, previewUrl };
  } catch (err) {
    logger.error(JSON.stringify({
      event: 'email_error',
      correlationId,
      to,
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE || env.SMTP_PORT === 465,
      error: err.message,
      stack: err.stack
    }));
    throw err;
  }
};

export const requestOTP = async (req, res) => {
  const { email } = req.body;
  const correlationId = crypto.randomUUID();
  const genStart = Date.now();
  
  // Anti-enumeration: Don't reveal if user exists.
  // We process OTP regardless, or create a temp record if needed (simplified here).
  
  let user = await User.findOne({ email });
  if (!user) {
    // Check if we want to allow new registrations
    // For this spec, we'll allow implicit registration logic or just assume exists
    // We will create the user on the fly or update existing
    const nickname = `User${Math.floor(Math.random() * 100000)}`;
    user = new User({
      email,
      nickname,
      nicknameLower: nickname.toLowerCase(),
    });
  }

  const otp = generateOTP();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(otp, salt);

  const expiryMs = env.OTP_EXPIRY_MINUTES * 60 * 1000;
  user.otpHash = otpHash;
  user.otpExpires = Date.now() + expiryMs;
  const now = Date.now();
  const cooldownMs = 60000;
  if (user.otpLastRequestedAt && (now - user.otpLastRequestedAt.getTime() < cooldownMs)) {
    return res.status(429).json({ message: 'Please wait before requesting another code.' });
  }
  user.otpLastRequestedAt = new Date(now);
  await user.save();
  const genDuration = Date.now() - genStart;
  logger.info(JSON.stringify({ event: 'otp_generated', correlationId, email, expiryMs, durationMs: genDuration }));

  try {
    await sendEmail(
      email, 
      'Your Login Code', 
      `Your anonymous login code is: ${otp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`,
      correlationId
    );
  } catch (err) {
    // Retry once for transient errors
    try {
      await sendEmail(
        email, 
        'Your Login Code', 
        `Your anonymous login code is: ${otp}. Valid for ${env.OTP_EXPIRY_MINUTES} minutes.`,
        correlationId
      );
    } catch (e2) {
      return res.status(500).json({ message: 'Failed to send code' });
    }
  }

  res.status(200).json({ message: 'If that email is registered, a code has been sent.' });
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  // Include otpHash and otpExpires in selection
  const user = await User.findOne({ email }).select('+otpHash +otpExpires +role');

  if (!user || !user.otpHash || !user.otpExpires) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (Date.now() > user.otpExpires) {
    return res.status(401).json({ message: 'Code expired' });
  }

  const isMatch = await bcrypt.compare(otp, user.otpHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid code' });
  }

  // Clear OTP
  user.otpHash = undefined;
  user.otpExpires = undefined;
  await user.save();

  // Create Session
  const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 1 day - could also be env driven if needed
  });

  res.json({ 
    message: 'Logged in',
    user: {
      _id: user._id,
      nickname: user.nickname,
      avatarId: user.avatarId,
      role: user.role,
      timezone: user.timezone || DEFAULT_TIMEZONE,
      profileNote: user.profileNote || '',
    }
  });
};

export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ message: 'Logged out' });
};

export const getMe = (req, res) => {
  // req.user is populated by protect middleware
  res.json({
    user: {
      _id: req.user._id,
      nickname: req.user.nickname,
      avatarId: req.user.avatarId,
      role: req.user.role,
      timezone: req.user.timezone || DEFAULT_TIMEZONE,
      profileNote: req.user.profileNote || '',
    }
  });
};
