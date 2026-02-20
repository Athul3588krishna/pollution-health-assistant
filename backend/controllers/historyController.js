const History = require('../models/History');

// Get all history entries
exports.getAllHistory = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const history = await History.find({ user: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await History.countDocuments({ user: req.user.userId });

    res.json({
      success: true,
      data: history,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: (parseInt(skip) + parseInt(limit)) < total
      }
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history', 
      message: error.message 
    });
  }
};

// Get history by location
exports.getHistoryByLocation = async (req, res) => {
  try {
    const { city } = req.params;

    const history = await History.find({ user: req.user.userId, 'location.city': city })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch location history', 
      message: error.message 
    });
  }
};

// Get single history entry
exports.getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await History.findOne({ _id: id, user: req.user.userId });

    if (!history) {
      return res.status(404).json({ 
        error: 'History entry not found' 
      });
    }

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching history entry:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history entry', 
      message: error.message 
    });
  }
};

// Delete history entry
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await History.findOneAndDelete({ _id: id, user: req.user.userId });

    if (!deleted) {
      return res.status(404).json({ 
        error: 'History entry not found' 
      });
    }

    res.json({
      success: true,
      message: 'History entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({ 
      error: 'Failed to delete history', 
      message: error.message 
    });
  }
};

// Clear all history
exports.clearHistory = async (req, res) => {
  try {
    await History.deleteMany({ user: req.user.userId });

    res.json({
      success: true,
      message: 'All history cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ 
      error: 'Failed to clear history', 
      message: error.message 
    });
  }
};
