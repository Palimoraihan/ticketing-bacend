const { Tag, Group, SLAPolicy, User } = require('../models');

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
      return res.status(404).send({ error: 'Tag not found' });
    }
    
    const updates = Object.keys(req.body);
    updates.forEach(update => tag[update] = req.body[update]);
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
        { model: Tag, as: 'tags' },
        { model: User, as: 'users' }
      ]
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
        { model: Tag, as: 'tags' },
        { model: User, as: 'users' }
      ]
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
        { model: Tag, as: 'tags' },
        { model: User, as: 'users' }
      ]
    });
    
    if (!group) {
      return res.status(404).send({ error: 'Group not found' });
    }
    
    if (tagIds) {
      await group.setTags(tagIds);
    }
    
    if (agentIds) {
      await group.setUsers(agentIds);
    }
    
    const updatedGroup = await Group.findByPk(group.id, {
      include: [
        { model: Tag, as: 'tags' },
        { model: User, as: 'users' }
      ]
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
      return res.status(404).send({ error: 'SLA Policy not found' });
    }
    
    const updates = Object.keys(req.body);
    updates.forEach(update => policy[update] = req.body[update]);
    await policy.save();
    
    res.send(policy);
  } catch (error) {
    res.status(400).send({ error: error.message });
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
  updateSLAPolicy
}; 