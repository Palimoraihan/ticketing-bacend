const { Ticket, Tag, User, TicketResponse, FileAttachment } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC files are allowed.'));
    }
  }
});

// Function to check and close overdue tickets
const checkAndCloseOverdueTickets = async () => {
  const now = new Date();
  const overdueTickets = await Ticket.findAll({
    where: {
      status: { [Op.ne]: 'closed' },
      responseDueDate: { [Op.lt]: now }
    }
  });

  for (const ticket of overdueTickets) {
    await ticket.update({ status: 'closed' });
  }
};

const createTicket = async (req, res) => {
  try {
    const { title, description, priority, tagIds } = req.body;
    
    // Validate required fields
    if (!title || !description || !priority) {
      return res.status(400).send({ 
        error: 'Missing required fields. Title, description, and priority are required.' 
      });
    }

    // Validate priority value
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).send({ 
        error: 'Invalid priority. Must be one of: low, medium, high, critical' 
      });
    }
    
    // Calculate due dates based on SLA
    const { responseDueDate, resolutionDueDate } = await Ticket.calculateDueDates(priority);
    
    const ticket = await Ticket.create({
      title,
      description,
      priority,
      customerId: req.user.id,
      status: 'open',
      responseDueDate,
      resolutionDueDate
    });

    if (tagIds && tagIds.length > 0) {
      await ticket.setTags(tagIds);
    }

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        ticketId: ticket.id
      }));
      await FileAttachment.bulkCreate(attachments);
    }

    const createdTicket = await Ticket.findByPk(ticket.id, {
      include: [
        { model: Tag, as: 'tags' },
        { model: User, as: 'customer' },
        { model: FileAttachment }
      ]
    });

    // Schedule check for overdue tickets
    setTimeout(checkAndCloseOverdueTickets, 60000); // Check every minute

    res.status(201).send(createdTicket);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getTickets = async (req, res) => {
  try {
    let tickets;
    if (req.user.role === 'customer') {
      tickets = await Ticket.findAll({
        where: { customerId: req.user.id },
        include: [
          { model: Tag, as: 'tags' },
          { model: User, as: 'agent' },
          { model: FileAttachment, as: 'attachments' }
        ]
      });
    } else if (req.user.role === 'agent') {
      // Get tickets with matching tags from agent's groups
      const agentGroups = await req.user.getGroups({
        include: [{ model: Tag, as: 'tags' }]
      });
      
      const agentTagIds = agentGroups.flatMap(group => 
        group.tags.map(tag => tag.id)
      );

      tickets = await Ticket.findAll({
        include: [
          {
            model: Tag,
            as: 'tags',
            where: { id: agentTagIds }
          },
          { model: User, as: 'customer' },
          { model: User, as: 'agent' },
          { model: FileAttachment, as: 'attachments' }
        ]
      });
    } else if (req.user.role === 'admin') {
      tickets = await Ticket.findAll({
        include: [
          { model: Tag, as: 'tags' },
          { model: User, as: 'customer' },
          { model: User, as: 'agent' },
          { model: FileAttachment, as: 'attachments' }
        ]
      });
    }

    res.send(tickets);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: Tag, as: 'tags' },
        { model: User, as: 'customer' },
        { model: User, as: 'agent' },
        { model: FileAttachment, as: 'attachments' },
        { 
          model: TicketResponse, 
          include: [
            { model: User, as: 'user' },
            { model: FileAttachment, as: 'attachments' }
          ]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).send({ error: 'Ticket not found' });
    }

    // Check permissions
    if (req.user.role === 'customer' && ticket.customerId !== req.user.id) {
      return res.status(403).send({ error: 'Access denied' });
    }

    if (req.user.role === 'agent') {
      const agentGroups = await req.user.getGroups({
        include: [{ model: Tag, as: 'tags' }]
      });
      
      const agentTagIds = agentGroups.flatMap(group => 
        group.tags.map(tag => tag.id)
      );

      const ticketTagIds = ticket.tags.map(tag => tag.id);
      const hasMatchingTag = ticketTagIds.some(id => agentTagIds.includes(id));

      if (!hasMatchingTag) {
        return res.status(403).send({ error: 'Access denied' });
      }
    }

    res.send(ticket);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: ['tags', 'customer', 'agent']
    });
    
    if (!ticket) {
      return res.status(404).send({ error: 'Ticket not found' });
    }

    // Check if priority is being updated
    if (req.body.priority && req.body.priority !== ticket.priority) {
      const { responseDueDate, resolutionDueDate } = await Ticket.calculateDueDates(req.body.priority);
      req.body.responseDueDate = responseDueDate;
      req.body.resolutionDueDate = resolutionDueDate;
    }

    const updates = Object.keys(req.body);
    updates.forEach(update => ticket[update] = req.body[update]);
    await ticket.save();
    
    res.send(ticket);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const addResponse = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    
    if (!ticket) {
      return res.status(404).send({ error: 'Ticket not found' });
    }

    const response = await TicketResponse.create({
      content: req.body.content,
      ticketId: ticket.id,
      userId: req.user.id
    });

    // Handle file uploads if any
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        responseId: response.id
      }));
      await FileAttachment.bulkCreate(attachments);
    }

    const createdResponse = await TicketResponse.findByPk(response.id, {
      include: [
        { model: User, as: 'user' },
        { model: FileAttachment, as: 'attachments' }
      ]
    });

    res.status(201).send(createdResponse);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const downloadFile = async (req, res) => {
  try {
    const file = await FileAttachment.findByPk(req.params.fileId, {
      include: [
        { model: Ticket },
        { model: TicketResponse }
      ]
    });

    if (!file) {
      return res.status(404).send({ error: 'File not found' });
    }

    // Check permissions
    if (req.user.role === 'customer') {
      // For customers, they can only download files from their own tickets
      if (file.ticket && file.ticket.customerId !== req.user.id) {
        return res.status(403).send({ error: 'Access denied' });
      }
      if (file.response && file.response.ticket.customerId !== req.user.id) {
        return res.status(403).send({ error: 'Access denied' });
      }
    } else if (req.user.role === 'agent') {
      // For agents, they can only download files from tickets with matching tags
      if (file.ticket) {
        const agentGroups = await req.user.getGroups({
          include: ['tags']
        });
        
        const agentTagIds = agentGroups.flatMap(group => 
          group.tags.map(tag => tag.id)
        );

        const ticketTagIds = file.ticket.tags.map(tag => tag.id);
        const hasMatchingTag = ticketTagIds.some(id => agentTagIds.includes(id));

        if (!hasMatchingTag) {
          return res.status(403).send({ error: 'Access denied' });
        }
      }
    }

    // Check if file exists
    if (!fs.existsSync(file.path)) {
      return res.status(404).send({ error: 'File not found on server' });
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);

    // Stream the file
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);

    // Handle errors during streaming
    fileStream.on('error', (error) => {
      console.error('Error streaming file:', error);
      res.status(500).send({ error: 'Error downloading file' });
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  addResponse,
  upload,
  downloadFile
}; 