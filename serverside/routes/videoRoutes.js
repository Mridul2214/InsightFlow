
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

router.post('/upload', protect, uploadVideo.single('video'), createvideo);

router.get('/all', getAllVideos);

router.get('/user/:userId', protect, getAllVideoByUser);

router.get('/:id', getVideoById);
router.delete('/:id', protect, deleteVideo);


router.post('/reaction/toggle', protect, toggleVideoReaction);
router.get('/:videoId/comments', getVideoComments);
router.post('/comments', protect, addVideoComment);
router.get('/auhtor/:userId/stats', getVideoAuthorStats);
router.post('/author/:userId/follow', protect, toggleVideoAuthorFollow);
router.put('/:id', protect, updateVideo);

export default router;
