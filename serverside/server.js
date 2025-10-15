import express from 'express';
import dotenv from 'dotenv';
import connection from './config/connection.js';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import userRoutes from './routes/userRoutes.js';
import followRoutes from './routes/followRoutes.js'
import commentsRoutes from './routes/commentRoutes.js'
import reactionRoutes from './routes/reactionRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import historyRoutes from './routes/historyRoutes.js'
import searchRoutes from './routes/searchRoutes.js'
import likedContentRoutes from "./routes/likedContentRoutes.js"
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corsOptions = {
  origin: 'http://localhost:5173', 
  credentials: true,
  optionsSuccessStatus: 200
};



app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// app.use('/uploads/videos', express.static(path.join('uploads/videos')));
// app.use('/uploads/profilePics', express.static(path.join('uploads/profilePics')));

connection(); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/comments', commentsRoutes)
app.use('/api/admin', adminRoutes);
app.use('/api/history', historyRoutes)
app.use('/api/search', searchRoutes);
app.use('/api/likedcontent',likedContentRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
