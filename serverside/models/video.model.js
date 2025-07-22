import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   tag: { type: [String], required: true },
//   video: { type: String, required: true },
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
//   createdAt: { type: Date, default: Date.now },
// });
  title: { type: String, required: true },
  tag: { type: [String], required: true },
  video: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Changed from 'user' to 'User'
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Video', videoSchema);
