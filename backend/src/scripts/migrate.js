import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';

const run = async () => {
  await mongoose.connect(env.MONGO_URI);
  // Làm sạch null trên usernameLower để tránh lỗi duplicate null
  await User.updateMany({ usernameLower: null }, { $unset: { usernameLower: 1 } });

  const users = await User.find({}).select('_id username nickname usernameLower');
  for (const u of users) {
    const base = u.username || u.nickname;
    if (base) {
      const lower = base.toLowerCase();
      if (u.usernameLower !== lower) {
        u.username = base;
        u.usernameLower = lower;
        await u.save();
      }
    }
  }

  // Đảm bảo index unique chỉ áp dụng khi field tồn tại
  try {
    await User.collection.dropIndex('usernameLower_1');
  } catch (err) {
    if (err.codeName !== 'IndexNotFound') {
      console.warn('dropIndex usernameLower_1', err.message);
    }
  }
  await User.collection.createIndex(
    { usernameLower: 1 },
    { unique: true, sparse: true, partialFilterExpression: { usernameLower: { $exists: true, $type: 'string' } } }
  );
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
