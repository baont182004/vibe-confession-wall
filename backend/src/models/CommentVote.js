import mongoose from 'mongoose';

const commentVoteSchema = new mongoose.Schema({
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  value: {
    type: Number,
    required: true,
    enum: [1, -1], // 1 for like, -1 for dislike
  },
}, { timestamps: true });

// Ensure one vote per user per comment
commentVoteSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export default mongoose.model('CommentVote', commentVoteSchema);
