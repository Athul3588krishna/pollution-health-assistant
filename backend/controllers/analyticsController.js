const History = require('../models/History');

// Get analytics overview
exports.getAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    // Get all history within the timeframe
    const history = await History.find({
      user: req.user.userId,
      timestamp: { $gte: dateThreshold }
    }).sort({ timestamp: -1 });

    // Calculate analytics
    const analytics = {
      totalChecks: history.length,
      uniqueLocations: [...new Set(history.map(h => h.location.city))].length,
      riskLevelDistribution: {
        Low: 0,
        Moderate: 0,
        High: 0,
        'Very High': 0,
        Severe: 0
      },
      averageAQI: 0,
      mostCheckedLocations: {},
      recentChecks: history.slice(0, 10)
    };

    // Calculate risk distribution and average AQI
    let totalAQI = 0;
    history.forEach(entry => {
      analytics.riskLevelDistribution[entry.healthRisk.level]++;
      totalAQI += entry.pollutionData.aqi;

      const city = entry.location.city;
      analytics.mostCheckedLocations[city] = (analytics.mostCheckedLocations[city] || 0) + 1;
    });

    analytics.averageAQI = history.length > 0 ? (totalAQI / history.length).toFixed(2) : 0;

    // Sort most checked locations
    analytics.mostCheckedLocations = Object.entries(analytics.mostCheckedLocations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    res.json({
      success: true,
      data: analytics,
      timeframe: `Last ${days} days`
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics', 
      message: error.message 
    });
  }
};

// Get location-specific analytics
exports.getLocationAnalytics = async (req, res) => {
  try {
    const { city } = req.params;
    const { days = 30 } = req.query;

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

    const history = await History.find({
      user: req.user.userId,
      'location.city': city,
      timestamp: { $gte: dateThreshold }
    }).sort({ timestamp: 1 });

    if (history.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No data available for this location',
          city
        }
      });
    }

    // Calculate trends
    const aqiTrend = history.map(h => ({
      date: h.timestamp,
      aqi: h.pollutionData.aqi,
      riskLevel: h.healthRisk.level
    }));

    const avgAQI = (history.reduce((sum, h) => sum + h.pollutionData.aqi, 0) / history.length).toFixed(2);
    const maxAQI = Math.max(...history.map(h => h.pollutionData.aqi));
    const minAQI = Math.min(...history.map(h => h.pollutionData.aqi));

    res.json({
      success: true,
      data: {
        city,
        totalChecks: history.length,
        aqiStats: {
          average: parseFloat(avgAQI),
          max: maxAQI,
          min: minAQI
        },
        aqiTrend,
        latestCheck: history[history.length - 1]
      },
      timeframe: `Last ${days} days`
    });
  } catch (error) {
    console.error('Error fetching location analytics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch location analytics', 
      message: error.message 
    });
  }
};

// Get comparison between multiple locations
exports.compareLocations = async (req, res) => {
  try {
    const { cities } = req.query; // Comma-separated list

    if (!cities) {
      return res.status(400).json({ 
        error: 'Cities parameter is required' 
      });
    }

    const cityList = cities.split(',').map(c => c.trim());
    const comparison = [];

    for (const city of cityList) {
      const latestEntry = await History.findOne({ user: req.user.userId, 'location.city': city })
        .sort({ timestamp: -1 });

      if (latestEntry) {
        comparison.push({
          city,
          aqi: latestEntry.pollutionData.aqi,
          riskLevel: latestEntry.healthRisk.level,
          temperature: latestEntry.weatherData.temperature,
          timestamp: latestEntry.timestamp
        });
      }
    }

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing locations:', error);
    res.status(500).json({ 
      error: 'Failed to compare locations', 
      message: error.message 
    });
  }
};
