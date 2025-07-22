import History from '../models/history.model'

export const addToHistory = async (req, res) => {
  const { contentId, contentType, title } = req.body;
  const historyItem = await History.create({
    user: req.user._id,
    contentId,
    contentType,
    title,
    timestamp: new Date()
  });
  res.status(201).json(historyItem);
};

export const getUserHistory = async (req, res) => {
  const history = await History.find({ user: req.user._id }).sort({ timestamp: -1 });
  res.status(200).json(history);
};

export const clearHistory = async (req, res) => {
  await History.deleteMany({ user: req.user._id });
  res.status(200).json({ message: 'History cleared' });
};