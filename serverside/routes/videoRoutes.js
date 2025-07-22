// serverside/routes/videoRoutes.js

import express from 'express';
import {
  createvideo,
  getAllVideos,
  getAllVideoByUser,
  getVideoById,
  deleteVideo,
  toggleVideoReaction,
  getVideoComments,
  addVideoComment,
  getVideoAuthorStats,
  toggleVideoAuthorFollow,
  updateVideo
} from '../controllers/videoController.js';

import uploadVideo from '../middleware/uploadvideo.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Upload a new video
router.post('/upload', protect, uploadVideo.single('video'), createvideo);

// ✅ Get all uploaded videos
router.get('/all', getAllVideos);

// ✅ Get videos uploaded by a specific user
router.get('/user/:userId', protect, getAllVideoByUser);

// ✅ Get a specific uploaded video by ID
router.get('/:id', getVideoById);
router.delete('/:id',protect,deleteVideo);


router.post('/reaction/toggle',protect,toggleVideoReaction);
router.get('/:videoId/comments',getVideoComments);
router.post('/comments',protect,addVideoComment);
router.get('/auhtor/:userId/stats',getVideoAuthorStats);
router.post('/author/:userId/follow',protect,toggleVideoAuthorFollow);
router.put('/:id', protect, updateVideo);
// router.post('/videos',
//   auth.verifyToken,      // First verify token
//   checkUserBanStatus,    // Then check ban status
//   uploadBlog.single('file'),  // Then handle upload
//   blogController.createBlog
// );

export default router;
