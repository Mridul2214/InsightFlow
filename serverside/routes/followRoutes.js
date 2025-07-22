// routes/userRoutes.js
import express from 'express';
import { getFollowerCount, getFollowStatus, toggleFollow } from '../controllers/followController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/follow/toggle - Toggle follow status
router.post('/toggle', protect, toggleFollow);

// GET /api/follow/count/:userId - Get follower count
router.get('/count/:userId', getFollowerCount);

// GET /api/follow/status/:userId - Check if current user follows another user
router.get('/status/:userId', protect, getFollowStatus);

export default router;