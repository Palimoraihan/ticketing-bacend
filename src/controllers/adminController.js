const { Tag, Group, SLAPolicy, User } = require("../models");
const { Ticket, TicketResponse, FileAttachment } = require("../models");
const { Op } = require("sequelize");

// Tag Management
const createTag = async (req, res) => {
  try {
    const tag = await Tag.create(req.body);
    res.status(201).send(tag);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.send(tags);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);

    if (!tag) {
      return res.status(404).send({ error: "Tag not found" });
    }

    const updates = Object.keys(req.body);
    updates.forEach((update) => (tag[update] = req.body[update]));
    await tag.save();

    res.send(tag);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Group Management
const createGroup = async (req, res) => {
  try {
    const { name, description, tagIds, agentIds } = req.body;

    const group = await Group.create({ name, description });

    if (tagIds && tagIds.length > 0) {
      await group.setTags(tagIds);
    }

    if (agentIds && agentIds.length > 0) {
      await group.setUsers(agentIds);
    }

    const createdGroup = await Group.findByPk(group.id, {
      include: [
        { model: Tag, as: "tags" },
        { model: User, as: "users" },
      ],
    });

    res.status(201).send(createdGroup);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        { model: Tag, as: "tags" },
        { model: User, as: "users" },
      ],
    });
    res.send(groups);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { tagIds, agentIds } = req.body;
    const group = await Group.findByPk(req.params.id, {
      include: [
        { model: Tag, as: "tags" },
        { model: User, as: "users" },
      ],
    });

    if (!group) {
      return res.status(404).send({ error: "Group not found" });
    }

    if (tagIds) {
      await group.setTags(tagIds);
    }

    if (agentIds) {
      await group.setUsers(agentIds);
    }

    const updatedGroup = await Group.findByPk(group.id, {
      include: [
        { model: Tag, as: "tags" },
        { model: User, as: "users" },
      ],
    });

    res.send(updatedGroup);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// SLA Management
const createSLAPolicy = async (req, res) => {
  try {
    const policy = await SLAPolicy.create(req.body);
    res.status(201).send(policy);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getSLAPolicies = async (req, res) => {
  try {
    const policies = await SLAPolicy.findAll();
    res.send(policies);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

const updateSLAPolicy = async (req, res) => {
  try {
    const policy = await SLAPolicy.findByPk(req.params.id);

    if (!policy) {
      return res.status(404).send({ error: "SLA Policy not found" });
    }

    const updates = Object.keys(req.body);
    updates.forEach((update) => (policy[update] = req.body[update]));
    await policy.save();

    res.send(policy);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

// Get all tickets for admin
const getAllTickets = async (req, res) => {
  try {
    const { status, priority, startDate, endDate, agentId, customerId, tags } =
      req.query;

    const where = {};

    // Add filters based on query parameters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }
    if (agentId) where.agentId = agentId;
    if (customerId) where.customerId = customerId;

    const tickets = await Ticket.findAll({
      where,
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "username", "email"],
        },
        {
          model: User,
          as: "agent",
          attributes: ["id", "username", "email"],
        },
        {
          model: Tag,
          as: "tags",
          through: { attributes: [] },
        },
        {
          model: TicketResponse,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "username"],
            },
            "attachments",
          ],
        },
        "attachments",
      ],
      order: [["createdAt", "DESC"]],
    });

    // Calculate statistics
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({ where: { status: "open" } });
    const resolvedTickets = await Ticket.count({
      where: { status: "resolved" },
    });
    const closedTickets = await Ticket.count({ where: { status: "closed" } });

    res.json({
      tickets,
      statistics: {
        totalTickets,
        openTickets,
        resolvedTickets,
        closedTickets,
      },
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Error fetching tickets" });
  }
};

// Admin Dashboard
const getAdminDashboard = async (req, res) => {
  try {
    // Get recent tickets (last 10)
    const recentTickets = await Ticket.findAll({
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "username", "email"],
        },
        {
          model: User,
          as: "agent",
          attributes: ["id", "username", "email"],
        },
        {
          model: Tag,
          as: "tags",
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    // Calculate statistics
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({ where: { status: "open" } });
    const resolvedTickets = await Ticket.count({
      where: { status: "resolved" },
    });
    const closedTickets = await Ticket.count({ where: { status: "closed" } });

    // Get total users by role
    const totalUsers = await User.count();
    const totalAgents = await User.count({ where: { role: "agent" } });
    const totalCustomers = await User.count({ where: { role: "customer" } });

    // Get total groups
    const totalGroups = await Group.count();

    res.json({
      stats: {
        tickets: {
          total: totalTickets,
          open: openTickets,
          resolved: resolvedTickets,
          closed: closedTickets,
        },
        users: {
          total: totalUsers,
          agents: totalAgents,
          customers: totalCustomers,
        },
        groups: {
          total: totalGroups,
        },
      },
      recentTickets: recentTickets.map((ticket) => ({
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        customer: ticket.customer,
        agent: ticket.agent,
        tags: ticket.tags,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

module.exports = {
  createTag,
  getTags,
  updateTag,
  createGroup,
  getGroups,
  updateGroup,
  createSLAPolicy,
  getSLAPolicies,
  updateSLAPolicy,
  getAllTickets,
  getAdminDashboard,
};
