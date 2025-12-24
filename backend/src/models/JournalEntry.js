import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  dateKey: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
}, { timestamps: true });

journalEntrySchema.index({ userId: 1, dateKey: 1 }, { unique: true });

export default mongoose.model('JournalEntry', journalEntrySchema);
