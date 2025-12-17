import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, enum: ['Post', 'Comment'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: true });

auditSchema.index({ createdAt: -1 });

export default mongoose.model('AdminAudit', auditSchema);
