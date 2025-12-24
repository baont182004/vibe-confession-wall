
import mongoose from 'mongoose';
import User from '../models/User.js';
import { env } from '../config/env.js';

const seed = async () => {
  await mongoose.connect(env.MONGO_URI);
  console.log('DB Connected');

  // Seed Admin
  const adminExists = await User.findOne({ email: env.ADMIN_EMAIL });
  if (!adminExists) {
    await User.create({
      email: env.ADMIN_EMAIL,
      nickname: env.ADMIN_NICKNAME,
      role: 'admin',
      avatarId: 1
    });
    console.log('Admin seeded');
  }

  console.log('Done');
  process.exit();
};

seed();
