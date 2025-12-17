
import mongoose from 'mongoose';

const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '💬' },
  order: { type: Number, default: 0 },
  isReadOnly: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('ChatRoom', chatRoomSchema);
