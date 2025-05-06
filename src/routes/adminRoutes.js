const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// All routes require admin role
router.use(auth, requireRole(['admin']));

// Dashboard
router.get('/dashboard', adminController.getAdminDashboard);

// Ticket Management
router.get('/tickets', adminController.getAllTickets);

// Tag routes
router.post('/tags', adminController.createTag);
router.get('/tags', adminController.getTags);
router.put('/tags/:id', adminController.updateTag);

// Group routes
router.post('/groups', adminController.createGroup);
router.get('/groups', adminController.getGroups);
router.put('/groups/:id', adminController.updateGroup);

// SLA routes
router.post('/sla-policies', adminController.createSLAPolicy);
router.get('/sla-policies', adminController.getSLAPolicies);
router.put('/sla-policies/:id', adminController.updateSLAPolicy);

module.exports = router; 