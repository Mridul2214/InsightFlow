import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createPost,
  uploadMiddleware,
  getPostsByUser,
  getAllPost, getPostById,
  deletePost,
  updatePost
} from '../controllers/postController.js';

const router = express.Router();

// POST /api/posts/upload
router.post('/upload', protect, uploadMiddleware, createPost);

// GET /api/posts/user/:id
router.get('/user/:id', getPostsByUser);

router.get('/all', getAllPost);
router.get('/:id', getPostById);
router.delete('/:id', protect, deletePost)


// routes/post.js
// In your post routes
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('uploader', 'name username avatar') // Explicitly select fields
      .exec();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// In your backend routes (likely routes/posts.js)
router.put('/:id', protect, uploadMiddleware, updatePost);



export default router;
