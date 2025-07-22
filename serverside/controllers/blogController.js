import Blog from '../models/blog.model.js';

export const uploadBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newBlog = new Blog({
      title,
      content,
      tag: tags.split(',').map(tag => tag.trim()), // Convert comma-separated tags to array
      userId: req.user._id,
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while uploading blog' });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate('userId', 'username');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blogs' });
  }
};

export const getBlogsBySpecificUser = async (req, res) => {
  try {
    const blogs = await Blog.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blogs by user ID' });
  }
};


export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await blog.deleteOne();
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error during blog deletion' });
  }
};


export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('userId', 'username name profilePicture')
      .populate('likes', 'username profilePicture')
      .populate('dislikes', 'username profilePicture');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
};


// import mongoose from 'mongoose';


// export const getBlogById = async (req, res) => {
//   try {
//     // Validate ID format
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({ message: 'Invalid blog ID format' });
//     }

//     const blog = await Blog.findById(req.params.id)
//       .populate('userId', 'username profilePicture')
//       .populate('likes', 'username profilePicture')
//       .populate('dislikes', 'username profilePicture');

//     if (!blog) {
//       return res.status(404).json({ message: 'Blog not found' });
//     }

//     res.json(blog);
//   } catch (err) {
//     console.error('Error fetching blog:', err);
//     res.status(500).json({ message: 'Failed to fetch blog' });
//   }
// };



export const toggleReaction = async (req, res) => {
  try {
    const { blogId, reactionType } = req.body;
    const userId = req.user._id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check existing reactions
    const likeIndex = blog.likes.indexOf(userId);
    const dislikeIndex = blog.dislikes.indexOf(userId);

    if (reactionType === 'like') {
      if (likeIndex >= 0) {
        blog.likes.splice(likeIndex, 1); // Remove like
      } else {
        blog.likes.push(userId); // Add like
        if (dislikeIndex >= 0) {
          blog.dislikes.splice(dislikeIndex, 1); // Remove dislike if exists
        }
      }
    } else if (reactionType === 'dislike') {
      if (dislikeIndex >= 0) {
        blog.dislikes.splice(dislikeIndex, 1); // Remove dislike
      } else {
        blog.dislikes.push(userId); // Add dislike
        if (likeIndex >= 0) {
          blog.likes.splice(likeIndex, 1); // Remove like if exists
        }
      }
    }

    await blog.save();
    
    // Get updated counts
    const updatedBlog = await Blog.findById(blogId)
      .populate('likes', 'username profilePicture')
      .populate('dislikes', 'username profilePicture');

    res.json({
      likes: updatedBlog.likes,
      dislikes: updatedBlog.dislikes,
      likesCount: updatedBlog.likes.length,
      dislikesCount: updatedBlog.dislikes.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update reaction' });
  }
};

export const getBlogComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      contentId: req.params.blogId,
      contentType: 'blog'
    }).populate('user', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { blogId, comment } = req.body;

    const newComment = new Comment({
      comment,
      user: req.user._id,
      contentId: blogId,
      contentType: 'blog'
    });

    await newComment.save();
    
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'username profilePicture');

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const getAuthorStats = async (req, res) => {
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

export const toggleFollow = async (req, res) => {
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

const fetchBlogData = async () => {
  try {
    // Use the correct backend URL (not frontend's port 3000)
    const response = await axios.get(
      `http://localhost:3000/api/blogs/${blogId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    setBlog(response.data);
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

// In your blog controller file
export const updateBlog = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { 
        title,
        content,
        tags,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    )
    .populate('userId', 'username name profilePicture')
    .populate('likes', 'username profilePicture')
    .populate('dislikes', 'username profilePicture');

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(updatedBlog);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error updating blog',
      error: err.message 
    });
  }
};


