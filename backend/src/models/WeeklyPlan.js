
import mongoose from 'mongoose';

const todoItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sunday, etc.
  completed: { type: Boolean, default: false },
  allowedDate: { type: String }, // ISO Date string YYYY-MM-DD
});

const weeklyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weekId: { type: String, required: true }, // Format: "2023-W42"
  items: [todoItemSchema],
  isClosed: { type: Boolean, default: false },
  score: { type: Number, default: 0 }
}, { timestamps: true });

weeklyPlanSchema.index({ userId: 1, weekId: 1 }, { unique: true });

export default mongoose.model('WeeklyPlan', weeklyPlanSchema);
