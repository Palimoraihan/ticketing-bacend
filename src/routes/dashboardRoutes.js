const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth, requireRole } = require('../middleware/auth');

// Customer dashboard route
router.get(
  '/customer',
  auth,
  requireRole(['customer']),
  dashboardController.getCustomerDashboard
);

// Agent dashboard route
router.get(
  '/agent',
  auth,
  requireRole(['agent']),
  dashboardController.getAgentDashboard
);

module.exports = router; 