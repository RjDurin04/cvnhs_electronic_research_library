const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/authMiddleware');
const { getPublicStats, getDashboardStats } = require('../controllers/statsController');

// Public (when mounted at /api/stats)
router.get('/', getPublicStats);

// Protected Dashboard (when mounted at /api/dashboard)
router.get('/stats', isAuthenticated, getDashboardStats);

module.exports = router;
