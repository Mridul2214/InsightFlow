import express from 'express';
import mongoose from 'mongoose';
import {
  getUserProfile, getFollowerCount, updateUserProfile,
  checkFollowStatus,
  getUserPosts,
  getUserVideos,
  getUserBlogs, getLikedContentByUserId,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
// import Reaction from '../models/reaction.model.js';
import fs from 'fs';
import multer from 'multer'
// import User from '../models/user.model.js' 

const router = express.Router();



router.get('/:id', getUserProfile);
// router.post('/follow', protect, followUser);
router.get('/followers/count/:userId', getFollowerCount);



const profileDir = 'uploads/profilePics';
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profilePics/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.put('/update/:id', protect, upload.single('profilePic'), updateUserProfile);
router.get('/is-following/:userId', protect, checkFollowStatus);
router.get('/:id/posts', getUserPosts);
router.get('/:id/videos', getUserVideos);
router.get('/:id/blogs', getUserBlogs);


router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name username'); // Only return name/username
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:userId/liked-content', getLikedContentByUserId)


export default router;
