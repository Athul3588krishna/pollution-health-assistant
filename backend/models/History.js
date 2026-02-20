const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  location: {
    city: { type: String, required: true },
    country: { type: String, required: true },
    coordinates: {
      lat: Number,
      lon: Number
    }
  },
  pollutionData: {
    aqi: { type: Number, required: true },
    pm25: Number,
    pm10: Number,
    co: Number,
    no2: Number,
    o3: Number,
    so2: Number
  },
  weatherData: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    description: String
  },
  healthRisk: {
    level: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Very High', 'Severe'],
      required: true
    },
    score: { type: Number, required: true },
    recommendations: [String],
    warnings: [String],
    suggestedMedicines: [String]
  },
  userHealthProfile: {
    age: Number,
    conditions: [String],
    smokingStatus: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
historySchema.index({ 'location.city': 1, timestamp: -1 });
historySchema.index({ timestamp: -1 });
historySchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('History', historySchema);
