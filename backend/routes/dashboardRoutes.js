const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authenticateToken = require('../middleware/authMiddleware');

// Dashboard metrics route is protected
router.get('/', authenticateToken, getDashboardStats);

module.exports = router;
