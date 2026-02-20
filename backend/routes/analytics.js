const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics - Get overall analytics
router.get('/', analyticsController.getAnalytics);

// GET /api/analytics/location/:city - Get location-specific analytics
router.get('/location/:city', analyticsController.getLocationAnalytics);

// GET /api/analytics/compare?cities=City1,City2,City3
router.get('/compare', analyticsController.compareLocations);

module.exports = router;
