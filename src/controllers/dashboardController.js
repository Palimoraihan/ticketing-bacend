const { Ticket, TicketResponse, User, Group, GroupAgent, Tag } = require('../models');
const { Op } = require('sequelize');

// Calculate average resolution time in hours
const calculateAverageResolutionTime = async (tickets) => {
  if (!tickets.length) return 0;
  
  const resolvedTickets = tickets.filter(ticket => ticket.status === 'resolved');
  if (!resolvedTickets.length) return 0;

  const totalTime = resolvedTickets.reduce((sum, ticket) => {
    const createdAt = new Date(ticket.createdAt);
    const updatedAt = new Date(ticket.updatedAt);
    const diffHours = (updatedAt - createdAt) / (1000 * 60 * 60);
    return sum + diffHours;
  }, 0);

  return Math.round(totalTime / resolvedTickets.length);
};

// Customer Dashboard
exports.getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all tickets for the customer
    const tickets = await Ticket.findAll({
      where: { customerId: userId },
      include: [
        {
          model: TicketResponse,
          include: ['attachments']
        },
        'attachments'
      ]
    });

    // Calculate statistics
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const averageResolutionTime = await calculateAverageResolutionTime(tickets);

    // Get recent tickets (last 5)
    const recentTickets = tickets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }));

    res.json({
      stats: {
        totalTickets,
        openTickets,
        resolvedTickets,
        averageResolutionTime
      },
      recentTickets
    });
  } catch (error) {
    console.error('Error fetching customer dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

// Agent Dashboard
exports.getAgentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get agent's groups with their tags
    const agentGroups = await GroupAgent.findAll({
      where: { agentId: userId },
      include: [{
        model: Group,
        as: 'group',
        include: [{
          model: Tag,
          as: 'tags'
        }]
      }]
    });

    if (!agentGroups || agentGroups.length === 0) {
      return res.json({
        stats: {
          assignedTickets: 0,
          pendingTickets: 0,
          resolvedTickets: 0,
          averageResolutionTime: 0
        },
        recentTickets: []
      });
    }

    // Get all unique tag IDs from agent's groups
    const agentTagIds = [...new Set(agentGroups.flatMap(ag => 
      ag.group.tags.map(tag => tag.id)
    ))];

    // Get tickets with matching tags
    const tickets = await Ticket.findAll({
      include: [
        {
          model: Tag,
          as: 'tags',
          where: {
            id: {
              [Op.in]: agentTagIds
            }
          }
        },
        {
          model: TicketResponse,
          include: ['attachments']
        },
        'attachments',
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    // Calculate statistics
    const assignedTickets = tickets.length;
    const pendingTickets = tickets.filter(t => t.status === 'open').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
    const averageResolutionTime = await calculateAverageResolutionTime(tickets);

    // Get recent tickets (last 5)
    const recentTickets = tickets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        customer: ticket.customer,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }));

    res.json({
      stats: {
        assignedTickets,
        pendingTickets,
        resolvedTickets,
        averageResolutionTime
      },
      recentTickets
    });
  } catch (error) {
    console.error('Error fetching agent dashboard:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
}; 