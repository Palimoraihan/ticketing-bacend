const { Ticket, Tag, User, TicketResponse } = require('../models');
const { Op } = require('sequelize');

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

    // Schedule check for overdue tickets
    setTimeout(checkAndCloseOverdueTickets, 60000); // Check every minute

    res.status(201).send(ticket);
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
        include: ['tags', 'agent']
      });
    } else if (req.user.role === 'agent') {
      // Get tickets with matching tags from agent's groups
      const agentGroups = await req.user.getGroups({
        include: ['tags']
      });
      
      const agentTagIds = agentGroups.flatMap(group => 
        group.tags.map(tag => tag.id)
      );

      tickets = await Ticket.findAll({
        include: [{
          model: Tag,
          where: { id: agentTagIds }
        }, 'customer', 'agent']
      });
    } else if (req.user.role === 'admin') {
      tickets = await Ticket.findAll({
        include: ['tags', 'customer', 'agent']
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
      include: ['tags', 'customer', 'agent', 'responses']
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
        include: ['tags']
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

    // Check permissions
    if (req.user.role === 'customer' && ticket.customerId !== req.user.id) {
      return res.status(403).send({ error: 'Access denied' });
    }

    if (req.user.role === 'agent' && ticket.agentId !== req.user.id) {
      return res.status(403).send({ error: 'Access denied' });
    }

    const response = await TicketResponse.create({
      content: req.body.content,
      ticketId: ticket.id,
      userId: req.user.id
    });

    res.status(201).send(response);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  addResponse
}; 