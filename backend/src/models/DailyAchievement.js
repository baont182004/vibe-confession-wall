import mongoose from 'mongoose';

const dailyAchievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dateKey: {
    type: String,
    required: true,
  },
  hasJournal: {
    type: Boolean,
    default: false,
  },
  dayPlanDone: {
    type: Boolean,
    default: false,
  },
  qualified: {
    type: Boolean,
    default: false,
  },
  awardedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

dailyAchievementSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export default mongoose.model('DailyAchievement', dailyAchievementSchema);
