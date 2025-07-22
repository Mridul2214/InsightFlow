import Comment from '../models/comment.model.js';

export const getComments = async (req, res) => {
  try {
    const { contentId } = req.params;

    const comments = await Comment.find({ contentId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { contentId, contentType, comment } = req.body;
    const userId = req.user._id;

    const newComment = new Comment({
      comment,
      user: userId,
      contentId,
      contentType
    });

    await newComment.save();
    
    // Populate user data before sending response
    const populatedComment = await Comment.findById(newComment._id)
      .populate('user', 'username');

    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};