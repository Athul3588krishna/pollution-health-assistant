const pollutionService = require('../utils/pollutionService');
const healthRiskAnalyzer = require('../utils/healthRiskAnalyzer');
const History = require('../models/History');

// Get pollution and weather data for a location
exports.getPollutionData = async (req, res) => {
  try {
    const { city, lat, lon } = req.query;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({ error: 'City or coordinates (lat/lon) are required' });
    }

    const data = city
      ? await pollutionService.getCompleteData(city)
      : await pollutionService.getCompleteDataByCoordinates(parseFloat(lat), parseFloat(lon));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching pollution data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch pollution data', 
      message: error.message 
    });
  }
};

// Analyze health risk
exports.analyzeHealthRisk = async (req, res) => {
  try {
    const { city, lat, lon, userProfile } = req.body;

    if (!city && (!lat || !lon)) {
      return res.status(400).json({ 
        error: 'City or coordinates (lat/lon) are required' 
      });
    }
    const profile = userProfile || {
      age: req.currentUser.age,
      healthConditions: req.currentUser.healthConditions || ['none'],
      smokingStatus: req.currentUser.smokingStatus || 'non-smoker'
    };

    // Get environmental data
    const envData = city
      ? await pollutionService.getCompleteData(city)
      : await pollutionService.getCompleteDataByCoordinates(parseFloat(lat), parseFloat(lon));

    // Analyze health risk
    const healthRisk = healthRiskAnalyzer.analyzeHealthRisk(
      {
        aqi: envData.pollution.aqi,
        ...envData.pollution.components
      },
      envData.weather,
      profile
    );

    // Save to history
    const historyEntry = new History({
      user: req.user.userId,
      location: envData.location,
      pollutionData: {
        aqi: envData.pollution.aqi,
        pm25: envData.pollution.components.pm25,
        pm10: envData.pollution.components.pm10,
        co: envData.pollution.components.co,
        no2: envData.pollution.components.no2,
        o3: envData.pollution.components.o3,
        so2: envData.pollution.components.so2
      },
      weatherData: envData.weather,
      healthRisk,
      userHealthProfile: {
        age: profile.age,
        conditions: profile.healthConditions || [],
        smokingStatus: profile.smokingStatus
      }
    });

    await historyEntry.save();

    res.json({
      success: true,
      data: {
        location: envData.location,
        pollution: envData.pollution,
        weather: envData.weather,
        healthRisk,
        historyId: historyEntry._id
      }
    });
  } catch (error) {
    console.error('Error analyzing health risk:', error);
    res.status(500).json({ 
      error: 'Failed to analyze health risk', 
      message: error.message 
    });
  }
};
