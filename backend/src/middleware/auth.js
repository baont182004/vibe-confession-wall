
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { env } from '../config/env.js';

export const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+role +bannedUntil');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status === 'banned') {
       if (user.bannedUntil && user.bannedUntil > new Date()) {
          return res.status(403).json({ message: `Account banned until ${user.bannedUntil}` });
       }
       // Auto-unban logic could go here or in a cron
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};
