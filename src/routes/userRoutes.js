const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const userController = require('../controllers/userController');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

// Admin only routes
router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  // Implementation for getting all users
});

module.exports = router; 