const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const ticketController = require('../controllers/ticketController');

// All routes require authentication
router.use(auth);

// Customer routes
router.post('/', requireRole(['customer']), ticketController.createTicket);
router.get('/', ticketController.getTickets);
router.get('/:id', ticketController.getTicket);

// Agent and Admin routes
router.patch('/:id', requireRole(['agent', 'admin']), ticketController.updateTicket);
router.post('/:id/responses', ticketController.addResponse);

module.exports = router; 