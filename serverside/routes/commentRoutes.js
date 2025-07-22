import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getComments, createComment } from '../controllers/commentController.js';

const router = express.Router();

router.get('/:contentId', getComments);
router.post('/', protect, createComment);

export default router;