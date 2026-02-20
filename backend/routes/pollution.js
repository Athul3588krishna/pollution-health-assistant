const express = require('express');
const router = express.Router();
const pollutionController = require('../controllers/pollutionController');

// GET /api/pollution/data?city=CityName
router.get('/data', pollutionController.getPollutionData);

// POST /api/pollution/analyze
router.post('/analyze', pollutionController.analyzeHealthRisk);

module.exports = router;
