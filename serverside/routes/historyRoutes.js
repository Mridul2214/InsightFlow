import express from 'express';
import History from '../models/history.model.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes now use the protect middleware
router.use(protect);

// Add to history
router.post('/', async (req, res) => {
  try {
    const { contentId, contentType, title } = req.body;

    const historyItem = new History({
      user: req.user._id,  // Using the authenticated user's ID
      contentId,
      contentType,
      title
    });

    await historyItem.save();
    res.status(201).json(historyItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's history
router.get('/', async (req, res) => {
  try {
    const history = await History.find({ user: req.user._id }).sort({ timestamp: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear history
router.delete('/', async (req, res) => {
  try {
    await History.deleteMany({ user: req.user._id });
    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove single item
router.delete('/:id', async (req, res) => {
  try {
    const item = await History.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id  // Ensure user can only delete their own items
    });

    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;