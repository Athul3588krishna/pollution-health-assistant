const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');

// GET /api/history - Get all history
router.get('/', historyController.getAllHistory);

// GET /api/history/location/:city - Get history by location
router.get('/location/:city', historyController.getHistoryByLocation);

// GET /api/history/:id - Get single history entry
router.get('/:id', historyController.getHistoryById);

// DELETE /api/history/:id - Delete history entry
router.delete('/:id', historyController.deleteHistory);

// DELETE /api/history - Clear all history
router.delete('/', historyController.clearHistory);

module.exports = router;
