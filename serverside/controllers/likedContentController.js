import LikedContent from '../models/likedContent.model.js';
import Post from '../models/post.model.js';
import Video from '../models/video.model.js';
import Blog from '../models/blog.model.js';

// Add content to liked list
export const addToLiked = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;
    const userId = req.user.id;

    // Check if already liked
    const existingLike = await LikedContent.findOne({
      user: userId,
      contentId,
      contentType
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Content already liked' });
    }

    // Add to liked content
    const likedContent = new LikedContent({
      user: userId,
      contentId,
      contentType
    });

    await likedContent.save();

    res.status(201).json({ message: 'Content added to liked list' });
  } catch (error) {
    console.error('Error adding to liked:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove content from liked list
export const removeFromLiked = async (req, res) => {
  try {
    const { contentId, contentType } = req.body;
    const userId = req.user.id;

    await LikedContent.findOneAndDelete({
      user: userId,
      contentId,
      contentType
    });

    res.json({ message: 'Content removed from liked list' });
  } catch (error) {
    console.error('Error removing from liked:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's liked content
export const getLikedContent = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all liked content for this user
    const likedItems = await LikedContent.find({ user: userId })
      .sort({ createdAt: -1 });

    // Group content IDs by type
    const contentIds = {
      post: [],
      video: [],
      blog: []
    };

    likedItems.forEach(item => {
      contentIds[item.contentType].push(item.contentId);
    });

    // Fetch content in parallel
    const [posts, videos, blogs] = await Promise.all([
      Post.find({ _id: { $in: contentIds.post } }),
      Video.find({ _id: { $in: contentIds.video } }),
      Blog.find({ _id: { $in: contentIds.blog } })
    ]);

    // Format response
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const data = {
      posts: posts.map(post => ({
        _id: post._id,
        title: post.title,
        image: post.image ? `${baseUrl}/uploads/${post.image}` : null,
        createdAt: post.createdAt
      })),
      videos: videos.map(video => ({
        _id: video._id,
        title: video.title,
        thumbnail: video.video ? `${baseUrl}/uploads/videos/${video.video}` : null,
        createdAt: video.createdAt
      })),
      blogs: blogs.map(blog => ({
        _id: blog._id,
        title: blog.title,
        excerpt: blog.content ? blog.content.substring(0, 150) + '...' : '',
        createdAt: blog.createdAt
      }))
    };

    res.json({ data });
  } catch (error) {
    console.error('Error fetching liked content:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if content is liked by user
export const checkLikedStatus = async (req, res) => {
  try {
    const { contentId, contentType } = req.params;
    const userId = req.user.id;

    const likedItem = await LikedContent.findOne({
      user: userId,
      contentId,
      contentType
    });

    res.json({ isLiked: !!likedItem });
  } catch (error) {
    console.error('Error checking liked status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
