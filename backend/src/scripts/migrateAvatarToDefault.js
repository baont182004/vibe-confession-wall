import mongoose from 'mongoose';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { computeAvatarIdFromId } from '../lib/avatarId.js';

const LEGACY_FIELDS = [
  'avatarUrl',
  'avatarPath',
  'avatarFileName',
  'profilePictureUrl',
  'profilePic',
  'profilePicture',
];

const hasLegacyFields = (user) => LEGACY_FIELDS.some((field) => user[field] !== undefined && user[field] !== null);

const isAvatarIdValid = (value) => Number.isInteger(value) && value >= 1 && value <= 31;

const run = async () => {
  await mongoose.connect(env.MONGO_URI);

  const candidates = await User.find({
    $or: [
      { avatarId: { $exists: false } },
      { avatarId: { $lt: 1 } },
      { avatarId: { $gt: 31 } },
      ...LEGACY_FIELDS.map((field) => ({ [field]: { $exists: true } })),
    ],
  }).select(['_id', 'avatarId', ...LEGACY_FIELDS].join(' '));

  let updatedCount = 0;
  const updates = [];

  for (const user of candidates) {
    const needsReset = !isAvatarIdValid(user.avatarId) || hasLegacyFields(user);
    if (!needsReset) continue;
    const nextAvatarId = computeAvatarIdFromId(user._id);
    const unsetPayload = {};
    LEGACY_FIELDS.forEach((field) => {
      unsetPayload[field] = 1;
    });

    updates.push({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { avatarId: nextAvatarId }, $unset: unsetPayload },
      },
    });
  }

  if (updates.length > 0) {
    const result = await User.bulkWrite(updates);
    updatedCount = result.modifiedCount || 0;
  }

  console.log(`[migrateAvatarToDefault] Updated users: ${updatedCount}`);
  process.exit(0);
};

run().catch((err) => {
  console.error('[migrateAvatarToDefault] Failed:', err);
  process.exit(1);
});
