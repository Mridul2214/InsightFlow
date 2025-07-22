import Video from '../models/video.model.js';
import mongoose from 'mongoose';

// Create video (uploaded)
export const createvideo = async (req, res) => {
  try {
    const { title, tags } = req.body;
    const videoPath = req.file ? req.file.filename : null;

    const newVideo = new Video({
      userId: req.user.id,
      title,
      tag: tags.split(',').map(tag => tag.trim()),
      video: videoPath,
    });

    await newVideo.save();
    res.status(200).json({ message: 'Video created successfully', video: newVideo });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all uploaded videos
export const getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error.message);
    res.status(500).json({ message: 'Error fetching videos' });
  }
};

// Get uploaded videos by user
export const getAllVideoByUser = async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user videos', error: err.message });
  }
};

// Get a specific uploaded video by ID
export const getVideoById = async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid video ID format' });
    }

    const video = await Video.findById(req.params.id)
      .populate('userId', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .populate('dislikes', 'username profilePicture');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (err) {
    console.error('Error fetching video:', err);
    res.status(500).json({ message: 'Failed to fetch video' });
  }
};



export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (video.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    await video.deleteOne();
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error during video deletion' });
  }
};







export const toggleVideoReaction = async (req, res) => {
  try {
    const { videoId, reactionType } = req.body;
    const userId = req.user._id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check existing reactions
    const likeIndex = video.likes.indexOf(userId);
    const dislikeIndex = video.dislikes.indexOf(userId);

    if (reactionType === 'like') {
      if (likeIndex >= 0) {
        video.likes.splice(likeIndex, 1); // Remove like
      } else {
        video.likes.push(userId); // Add like
        if (dislikeIndex >= 0) {
          video.dislikes.splice(dislikeIndex, 1); // Remove dislike if exists
        }
      }
    } else if (reactionType === 'dislike') {
      if (dislikeIndex >= 0) {
        video.dislikes.splice(dislikeIndex, 1); // Remove dislike
      } else {
        video.dislikes.push(userId); // Add dislike
        if (likeIndex >= 0) {
          video.likes.splice(likeIndex, 1); // Remove like if exists
        }
      }
    }

    await video.save();

    
    // Get updated counts
    const updatedVideo = await Video.findById(videoId)
      .populate('likes', 'username profilePicture')
      .populate('dislikes', 'username profilePicture');

    res.json({
      likes: updatedVideo.likes,
      dislikes: updatedVideo.dislikes,
      likesCount: updatedVideo.likes.length,
      dislikesCount: updatedVideo.dislikes.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update reaction' });
  }
};

export const getVideoComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      contentId: req.params.videoId,
      contentType: 'video'
    }).populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const addVideoComment = async (req, res) => {
  try {
    const { videoId, comment } = req.body;

    const newComment = new Comment({
      comment,
      user: req.user._id,
      contentId: videoId,
      contentType: 'video'
    });

    await newComment.save();
    
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'username profilePicture');

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};



export const getVideoAuthorStats = async (req, res) => {
  try {
    const author = await User.findById(req.params.userId)
      .select('followers following');
    
    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    const isFollowing = req.user ? author.followers.includes(req.user._id) : false;
    
    res.json({
      followerCount: author.followers.length,
      isFollowing
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get author stats' });
  }
};

export const toggleVideoAuthorFollow = async (req, res) => {
  try {
    const authorId = req.params.userId;
    const followerId = req.user._id;

    if (authorId === followerId.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const author = await User.findById(authorId);
    const follower = await User.findById(followerId);

    if (!author || !follower) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = author.followers.includes(followerId);
    
    if (isFollowing) {
      author.followers.pull(followerId);
      follower.following.pull(authorId);
    } else {
      author.followers.push(followerId);
      follower.following.push(authorId);
    }

    await Promise.all([author.save(), follower.save()]);

    res.json({
      isFollowing: !isFollowing,
      followerCount: author.followers.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle follow' });
  }
};


const fetchVideoData = async () => {
  try {
    // Use the correct backend URL (not frontend's port 3000)
    const response = await axios.get(
      `http://localhost:5000/api/videos/${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    setVideo(response.data);
  } catch (err) {
    console.error('Error details:', {
      status: err.response?.status,
      message: err.response?.data?.message || err.message,
      url: err.config?.url
    });
    
    if (err.response?.status === 404) {
      navigate('/not-found');
    }
  }
};


export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(video);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



