import mongoose from 'mongoose';

const likedContentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, enum: ['post', 'video', 'blog'], required: true },
  createdAt: { type: Date, default: Date.now }
});

likedContentSchema.index({ user: 1, contentId: 1, contentType: 1 }, { unique: true });

export default mongoose.model('LikedContent', likedContentSchema);
