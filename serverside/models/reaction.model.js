import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['like', 'dislike'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, enum: ['post', 'blog', 'video'], required: true },
  createdAt: { type: Date, default: Date.now }
});
reactionSchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });

export default mongoose.model('Reaction', reactionSchema);