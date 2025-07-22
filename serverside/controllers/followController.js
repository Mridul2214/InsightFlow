import Follow from '../models/follow.model.js'
import mongoose from 'mongoose';


// Toggle follow
export const toggleFollow = async (req, res) => {
  try {
    const follower = req.user._id;
    const { following } = req.body;

    if (!following) {
      return res.status(400).json({ error: "Following ID is required" });
    }

    const existing = await Follow.findOneAndDelete({ follower, following });
    if (!existing) {
      await Follow.create({ follower, following });
    }

    const count = await Follow.countDocuments({ following });
    res.json({
      isFollowing: !existing,
      count
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get follower count
export const getFollowerCount = async (req, res) => {
  try {
    console.log('Received request for user:', req.params.userId); // Debug log
    
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      console.error('Invalid ID format:', req.params.userId);
      return res.status(400).json({ error: "Invalid user ID format" });
    }
    
    const count = await Follow.countDocuments({ 
      following: req.params.userId 
    });
    
    console.log('Returning count:', count); // Debug log
    res.json({ count });
    
  } catch (err) {
    console.error('Follower count error:', err); // Detailed error
    res.status(500).json({ 
      error: "Server error",
      details: err.message 
    });
  }
};

// Check follow status
export const getFollowStatus = async (req, res) => {
  try {
    const exists = await Follow.exists({
      follower: req.user._id,
      following: req.params.userId
    });
    res.json({ isFollowing: !!exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};