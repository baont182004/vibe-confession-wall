
import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  targetType: {
    type: String,
    enum: ['Post', 'Comment'],
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['heart', 'hug', 'thanks'],
    required: true,
  }
}, { timestamps: true });

reactionSchema.index({ targetId: 1, userId: 1, type: 1 });
reactionSchema.index(
  { targetId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { targetType: 'Post' } }
);

export default mongoose.model('Reaction', reactionSchema);
