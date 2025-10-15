import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  addToLiked,
  removeFromLiked,
  getLikedContent,
  checkLikedStatus
} from '../controllers/likedContentController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Add content to liked list
router.post('/add', addToLiked);

// Remove content from liked list
router.delete('/remove', removeFromLiked);

// Get user's liked content
router.get('/', getLikedContent);

// Check if specific content is liked
router.get('/status/:contentId/:contentType', checkLikedStatus);

export default router;
