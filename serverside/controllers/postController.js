import Post from '../models/post.model.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join('uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `post_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

export const uploadMiddleware = upload.single('image');

// ✅ Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const imagePath = req.file ? req.file.filename : null;

    const newPost = new Post({
      userId: req.user.id,
      title,
      description,
      tag: tags.split(',').map(tag => tag.trim()), // convert to array
      image: imagePath,
    });

    await newPost.save();
    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ✅ Get all posts (for /api/posts/all)
export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
};




// export const getAllPost = async (req, res) => {
//   try {
//     const posts = await Post.find()
//       .populate('uploader', 'name username avatar') // Ensure these fields match your User model
//       .sort({ createdAt: -1 })
//       .lean();

//     const enhancedPosts = posts.map(post => ({
//       ...post,
//       uploaderName: post.uploader?.name || 'Community Member',
//       image: post.image ? `${req.protocol}://${req.get('host')}/uploads/posts/${post.image}` : null
//     }));

//     res.json(enhancedPosts);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching posts' });
//   }
// };



// ✅ Get posts by user
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id }); // ✅ Fix key: should be `userId`
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user posts', error: err.message });
  }
};



// ✅ Get a single post by ID (for /api/posts/:id)
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', '_id username')  // Make sure this matches your schema
      .exec();

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Verify populated data
    console.log('Post with user:', {
      _id: post._id,
      userId: post.userId,
      title: post.title
    });
    
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching post', error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error during post deletion' });
  }
};



// postController.js - Add this new controller function
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Verify post owner
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const updates = {
      title: req.body.title || post.title,
      description: req.body.description || post.description,
      tag: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : post.tag
    };

    // Handle image update if new file was uploaded
    if (req.file) {
      // Delete old image if it exists
      if (post.image) {
        const oldImagePath = path.join('uploads', post.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updates.image = req.file.filename;
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'username name');

    res.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ 
      message: 'Error updating post',
      error: error.message 
    });
  }
};


