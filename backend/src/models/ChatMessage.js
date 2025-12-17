
import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: { type: String, required: true, maxLength: 500 },
  status: {
    type: String,
    enum: ['active', 'hidden'],
    default: 'active'
  }
}, { timestamps: true });

chatMessageSchema.index({ room: 1, createdAt: -1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
