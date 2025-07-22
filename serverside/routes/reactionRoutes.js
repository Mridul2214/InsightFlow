import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { toggleReaction, getReactions } from '../controllers/reactionController.js';

const router = express.Router();

router.post('/toggle', protect, toggleReaction);
router.get('/:contentId', getReactions);

export default router;