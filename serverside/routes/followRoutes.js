import express from 'express';
import { getFollowerCount, getFollowStatus, toggleFollow } from '../controllers/followController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/toggle', protect, toggleFollow);

router.get('/count/:userId', getFollowerCount);

router.get('/status/:userId', protect, getFollowStatus);

export default router;