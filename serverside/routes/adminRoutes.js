import express from 'express';
import {
  adminStats,
  getAllUsers,
  manageUserStatus,
  getAllContent,
  manageContent,
  adminLogin,
  verifyAdmin
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/login', adminLogin)

// Admin dashboard stats

router.get('/stats', adminAuth, adminStats);
router.get('/users', adminAuth, getAllUsers);
router.patch('/users/:userId', adminAuth, manageUserStatus);
router.get('/content/:type', adminAuth, getAllContent);
router.patch('/content/:type/:id', adminAuth, manageContent);
router.get('/verify', adminAuth, verifyAdmin)
export default router;