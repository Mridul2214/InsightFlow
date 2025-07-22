import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Video from '../models/video.model.js';
import Blog from '../models/blog.model.js';
import jwt from 'jsonwebtoken';


export const adminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalBlogs = await Blog.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalPosts,
        totalVideos,
        totalBlogs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password') // Exclude passwords
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      data: users // Direct array of users
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

export const manageUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; // 'ban' or 'unban'

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.isBanned = action === 'ban';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${action === 'ban' ? 'banned' : 'unbanned'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// controllers/admin.controller.js
export const getAllContent = async (req, res) => {
  try {
    const { type } = req.params; // 'posts', 'videos', or 'blogs'

    let model;
    switch (type) {
      case 'posts':
        model = Post;
        break;
      case 'videos':
        model = Video;
        break;
      case 'blogs':
        model = Blog;
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid content type' });
    }

    const content = await model.find()
      .populate('userId', 'name username profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: content // Direct array of content items
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const manageContent = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { action } = req.body; // 'delete', 'feature', etc.

    let model;
    switch (type) {
      case 'posts':
        model = Post;
        break;
      case 'videos':
        model = Video;
        break;
      case 'blogs':
        model = Blog;
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid content type' });
    }

    if (action === 'delete') {
      await model.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Content deleted successfully' });
    }

    // Add other actions as needed
    res.status(400).json({ success: false, error: 'Invalid action' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// controllers/admin.controller.js
export const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body; 

    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: action === 'ban' },
      { new: true }
    );

    if (action === 'ban') {
      await Promise.all([
        Post.updateMany({ userId }, { isBlocked: true }),
        Video.updateMany({ userId }, { isBlocked: true }),
        Blog.updateMany({ userId }, { isBlocked: true })
      ]);
    }

    res.status(200).json({
      success: true,
      message: `User ${action === 'ban' ? 'banned' : 'unbanned'} successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};  



export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== 'mridul1422@gmail.com') {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const admin = await User.findOne({ email });
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Admin account not found'
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
  expiresIn: '1d',
});


    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 8 * 60 * 60 * 1000,
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};


export const verifyAdmin = async (req, res) => {
  try {
    // The adminAuth middleware already verified the token
    res.status(200).json({
      success: true,
      admin: req.admin // From the middleware
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};