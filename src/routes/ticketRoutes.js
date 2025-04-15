const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const ticketController = require('../controllers/ticketController');

// All routes require authentication
router.use(auth);

// Customer routes
router.post('/', 
  requireRole(['customer']),
  ticketController.upload.array('attachments', 5), // Allow up to 5 files
  ticketController.createTicket
);

router.get('/',
  ticketController.getTickets
);

// Agent and Admin routes
router.get('/:id', 
  requireRole(['agent', 'admin']),
  ticketController.getTicket
);

router.patch('/:id', 
  requireRole(['agent', 'admin']),
  ticketController.updateTicket
);

router.post('/:id/responses',
  requireRole(['agent', 'admin']),
  ticketController.upload.array('attachments', 5), // Allow up to 5 files
  ticketController.addResponse
);

// File download route
router.get('/attachments/:fileId',
  requireRole(['customer', 'agent', 'admin']),
  ticketController.downloadFile
);

module.exports = router; 