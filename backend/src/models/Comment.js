import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 1000,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active',
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Cache counts to avoid N+1 count queries
  voteCounts: {
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
  }
}, { timestamps: true });

commentSchema.index({ postId: 1, createdAt: -1 });

export default mongoose.model('Comment', commentSchema);
