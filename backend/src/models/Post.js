
import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxLength: 2000,
  },
  tags: [String],
  status: {
    type: String,
    enum: ['active', 'hidden', 'deleted'],
    default: 'active',
  },
  reactionCounts: {
    heart: { type: Number, default: 0 },
    hug: { type: Number, default: 0 },
    thanks: { type: Number, default: 0 },
  },
  reportCount: { type: Number, default: 0 },
}, { timestamps: true });

postSchema.index({ createdAt: -1 });
postSchema.index({ 'reactionCounts.heart': -1 }); // For trending

export default mongoose.model('Post', postSchema);
