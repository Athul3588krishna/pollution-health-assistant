const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

router.get('/insights', authMiddleware, aiController.getPersonalizedInsights);

module.exports = router;
