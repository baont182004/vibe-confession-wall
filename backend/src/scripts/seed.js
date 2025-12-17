
import mongoose from 'mongoose';
import User from '../models/User.js';
import ChatRoom from '../models/ChatRoom.js';
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
      avatarId: 100
    });
    console.log('Admin seeded');
  }

  // Seed Chat Rooms
  const rooms = [
    { name: 'General', topic: 'Anything and everything', icon: '🌍', order: 1 },
    { name: 'Academics', topic: 'Study tips and homework', icon: '📚', order: 2 },
    { name: 'Mental Health', topic: 'Peer support and venting', icon: '💚', order: 3 },
    { name: 'Campus Life', topic: 'Events and dorms', icon: '🏫', order: 4 },
    { name: 'Careers', topic: 'Jobs and internships', icon: '💼', order: 5 },
  ];

  for (const r of rooms) {
    const exists = await ChatRoom.findOne({ name: r.name });
    if (!exists) {
      await ChatRoom.create(r);
      console.log(`Room ${r.name} created`);
    }
  }

  console.log('Done');
  process.exit();
};

seed();
