const History = require('../models/History');
const { generateInsights } = require('../utils/aiInsights');

exports.getPersonalizedInsights = async (req, res) => {
  try {
    const history = await History.find({ user: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(7);

    const insights = generateInsights(history);
    return res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to generate AI insights',
      message: error.message
    });
  }
};
