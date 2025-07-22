import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, enum: ['post','blog','video'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Comment', commentSchema);