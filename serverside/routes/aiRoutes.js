// backend/ai/aiRoutes.js
import express from 'express';
import {  protect } from '../middleware/authMiddleware.js';
import { summarizeText,generateTitleDescription,handleAITags} from '../controllers/aiController.js'; 
const router = express.Router();

// router.post('/summarize',protect,summarizeText);
router.post('/summarize', protect, summarizeText);
router.post('/suggest',generateTitleDescription);
router.post('/tags',handleAITags)

export default router;