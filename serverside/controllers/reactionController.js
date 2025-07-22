import Reaction from '../models/reaction.model.js';

export const toggleReaction = async (req, res) => {
  try {
    const { contentId, contentType, type } = req.body;
    const userId = req.user._id;

    // Check if reaction already exists
    const existingReaction = await Reaction.findOne({
      user: userId,
      contentId,
      contentType
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // Remove reaction if same type clicked again
        await Reaction.findByIdAndDelete(existingReaction._id);
        return res.json({ message: 'Reaction removed' });
      } else {
        // Update reaction if different type clicked
        existingReaction.type = type;
        await existingReaction.save();
        return res.json({ message: 'Reaction updated' });
      }
    }

    // Create new reaction
    const newReaction = new Reaction({
      type,
      user: userId,
      contentId,
      contentType
    });

    await newReaction.save();
    res.status(201).json({ message: 'Reaction added' });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getReactions = async (req, res) => {
  try {
    const { contentId } = req.params;

    const likes = await Reaction.countDocuments({
      contentId,
      type: 'like'
    });

    const dislikes = await Reaction.countDocuments({
      contentId,
      type: 'dislike'
    });

    res.json({ likes, dislikes });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};