// routes/savedItems.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SavedItem = require('../models/SavedItem');

// Save an item
router.post('/', auth, async (req, res) => {
  try {
    const { contentId, contentType } = req.body;

    // Check if already saved
    const existing = await SavedItem.findOne({
      user: req.user._id,
      content: contentId,
      contentType
    });

    if (existing) {
      return res.status(400).json({ error: 'Item already saved' });
    }

    const savedItem = new SavedItem({
      user: req.user._id,
      content: contentId,
      contentType
    });

    await savedItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user's saved items
router.get('/', auth, async (req, res) => {
  try {
    const savedItems = await SavedItem.find({ user: req.user._id })
      .populate('content')
      .sort({ createdAt: -1 });

    res.json(savedItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove saved item
router.delete('/:id', auth, async (req, res) => {
  try {
    const savedItem = await SavedItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!savedItem) {
      return res.status(404).json({ error: 'Saved item not found' });
    }

    res.json({ message: 'Saved item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if item is saved
router.get('/check/:contentId/:contentType', auth, async (req, res) => {
  try {
    const savedItem = await SavedItem.findOne({
      user: req.user._id,
      content: req.params.contentId,
      contentType: req.params.contentType
    });

    res.json({ isSaved: !!savedItem });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;