import express from 'express';
import { uploadBlog, getAllBlogs,getBlogsBySpecificUser , deleteBlog,
     getBlogById, toggleReaction, getBlogComments, addComment,
      getAuthorStats, toggleFollow,updateBlog,} from '../controllers/blogController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', protect, uploadBlog);
router.get('/all', getAllBlogs);
router.get('/user/:userId', getBlogsBySpecificUser);
router.delete('/:id', protect, deleteBlog);


router.get('/:id',getBlogById);
router.post('/reaction/toggle',protect,toggleReaction);
router.get(':blogId/comments',getBlogComments);
router.post('/comments',protect,addComment);
router.get('/auhtor/:userId/stats',getAuthorStats);
router.post('/author/:userId/follow',protect,toggleFollow);
// In your blog routes file
router.put('/:id', protect, updateBlog);

// router.post('/blogs',
//   auth.verifyToken,      // First verify token
//   checkUserBanStatus,    // Then check ban status
//   uploadBlog.single('file'),  // Then handle upload
//   blogController.createBlog
// );


export default router;
