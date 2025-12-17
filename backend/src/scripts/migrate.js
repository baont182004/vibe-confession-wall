import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';

const run = async () => {
  await mongoose.connect(env.MONGO_URI);
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
  await User.collection.createIndex({ usernameLower: 1 }, { unique: true, sparse: true });
  process.exit(0);
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
