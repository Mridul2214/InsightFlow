 import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Video from '../models/video.model.js';
import Blog from '../models/blog.model.js';
import mongoose from 'mongoose';
import Reaction from '../models/reaction.model.js';
import path from 'path';
import fs from 'fs'

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Get user with basic info
    const user = await User.findById(userId)
      .select('-password -__v -resetPasswordToken -resetPasswordExpire')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get counts in parallel
    const [postsCount, videosCount, blogsCount, followersCount, followingCount] = await Promise.all([
      Post.countDocuments({ userId }),
      Video.countDocuments({ userId }),
      Blog.countDocuments({ userId }),
      User.countDocuments({ following: userId }),
      User.countDocuments({ followers: userId })
    ]);

    // Format profile picture URL
    const profilePicUrl = user.profilePic 
      ? `${req.protocol}://${req.get('host')}/uploads/profilePics/${user.profilePic}`
      : null;

    res.status(200).json({
      user: {
        ...user,
        profilePic: profilePicUrl
      },
      stats: {
        posts: postsCount,
        videos: videosCount,
        blogs: blogsCount,
        followers: followersCount,
        following: followingCount
      }
    });
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to load profile', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Add these new controller functions
export const getUserPosts = async (req, res) => {
  try {
    const posts = await posts.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .select('_id title image likesCount commentsCount createdAt')
      .lean();
      
    const postsWithUrls = posts.map(post => ({
      ...post,
      image: post.image ? `${req.protocol}://${req.get('host')}/uploads/posts/${post.image}` : null
    }));

    res.json(postsWithUrls);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to get user posts',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .select('_id title thumbnailUrl videoUrl viewsCount likesCount createdAt')
      .lean();
    res.json(videos);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to get user videos',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getUserBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .select('_id title coverImage excerpt readTime likesCount commentsCount createdAt')
      .lean();
      
    const blogsWithUrls = blogs.map(blog => ({
      ...blog,
      coverImage: blog.coverImage ? `${req.protocol}://${req.get('host')}/uploads/blogs/${blog.coverImage}` : null
    }));

    res.json(blogsWithUrls);
  } catch (err) {
    res.status(500).json({ 
      message: 'Failed to get user blogs',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



// In userController.js
export const getFollowerCount = async (req, res) => {
  try {
    // Validate the userId format
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(req.params.userId)
      .select('followers');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      count: user.followers?.length || 0,
      userId: user._id 
    });
  } catch (err) {
    console.error('Error in getFollowerCount:', {
      userId: req.params.userId,
      error: err.message
    });
    res.status(500).json({ 
      message: 'Error getting follower count',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = {
      name: req.body.name,
      email: req.body.email,
      username: req.body.username,
      bio: req.body.bio
    };

    // Handle file upload if exists
    if (req.file) {
      // Delete old profile picture if exists
      const user = await User.findById(userId);
      if (user.profilePic) {
        const oldPath = path.join(process.cwd(), 'public', user.profilePic);
        fs.unlink(oldPath, (err) => {
          if (err) console.log('Failed to delete old image:', err);
        });
      }

      // Create new path (just store the filename, not full path)
      updates.profilePic = req.file.filename;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    );

    // Construct full URL for the profile picture
    const profilePicUrl = updatedUser.profilePic
      ? `${req.protocol}://${req.get('host')}/uploads/profilePics/${updatedUser.profilePic}`
      : null;

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profilePic: profilePicUrl
      }
    });

  } catch (err) {
    console.error('Update error:', err);
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

// In userController.js
export const checkFollowStatus = async (req, res) => {
  try {
    // Validate both user IDs
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.following.includes(req.params.userId);
    
    res.json({ 
      isFollowing,
      currentUserId: req.user.id,
      targetUserId: req.params.userId
    });
  } catch (err) {
    console.error('Error in checkFollowStatus:', {
      currentUserId: req.user.id,
      targetUserId: req.params.userId,
      error: err.message
    });
    res.status(500).json({ 
      message: 'Error checking follow status',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};



export const getLikedContentByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. Get all 'like' reactions for this user
    const reactions = await Reaction.find({
      user: userId,
      type: 'like' // Only fetch likes
    });

    // 2. Group content IDs by type for batch fetching
    const contentMap = {
      post: [],
      video: [],
      blog: []
    };

    reactions.forEach(reaction => {
      contentMap[reaction.contentType].push(reaction.contentId);
    });

    // 3. Fetch all content in parallel for efficiency
    const [posts, videos, blogs] = await Promise.all([
      Post.find({ _id: { $in: contentMap.post } }).select('title image createdAt'),
      Video.find({ _id: { $in: contentMap.video } }).select('title videoUrl thumbnail'),
      Blog.find({ _id: { $in: contentMap.blog } }).select('title excerpt createdAt')
    ]);

    // 4. Structure the response
    const likedContent = {
      posts,
      videos,
      blogs
    };

    res.status(200).json({
      success: true,
      data: likedContent
    });

  } catch (error) {
    console.error('Error fetching liked content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching liked content',
      error: error.message
    });
  }
};


export const getCurrentUserprofile = async (req, res) => {
  try {
    const user = req.user; // populated by protect middleware
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isBanned: user.isBanned,
      // add more fields as needed
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
