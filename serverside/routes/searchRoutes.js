// routes/searchRoutes.js
import express from 'express';
import Post from '../models/post.model.js';
import Blog from '../models/blog.model.js';
import Video from '../models/video.model.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ message: 'No search query provided' });

  try {
    const regex = new RegExp(query, 'i'); // case-insensitive

    const [posts, blogs, videos] = await Promise.all([
      Post.find({ $or: [{ title: regex }, { description: regex }] }).populate('userId', 'username'),
      Blog.find({ $or: [{ title: regex }, { content: regex }, { tags: regex }] }).populate('userId', 'username'),
      Video.find({ $or: [{ title: regex }, { description: regex }, { tags: regex }] }).populate('userId', 'username'),
    ]);

    const results = [
      ...posts.map(p => ({ ...p._doc, contentType: 'post' })),
      ...blogs.map(b => ({ ...b._doc, contentType: 'blog' })),
      ...videos.map(v => ({ ...v._doc, contentType: 'video' })),
    ];

    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ message: 'Search failed', error: err.message });
  }
});

export default router;
