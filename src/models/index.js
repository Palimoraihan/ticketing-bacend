const User = require('./User');
const Ticket = require('./Ticket');
const Tag = require('./Tag');
const Group = require('./Group');
const SLAPolicy = require('./SLAPolicy');
const TicketTag = require('./TicketTag');
const GroupTag = require('./GroupTag');
const GroupAgent = require('./GroupAgent');
const TicketResponse = require('./TicketResponse');
const FileAttachment = require('./FileAttachment');

// User associations
User.hasMany(Ticket, { as: 'customerTickets', foreignKey: 'customerId' });
User.hasMany(Ticket, { as: 'agentTickets', foreignKey: 'agentId' });
User.hasMany(TicketResponse, { foreignKey: 'userId' });
User.belongsToMany(Group, { through: GroupAgent, foreignKey: 'agentId', as: 'groups' });

// Ticket associations
Ticket.belongsTo(User, { as: 'customer', foreignKey: 'customerId' });
Ticket.belongsTo(User, { as: 'agent', foreignKey: 'agentId' });
Ticket.hasMany(TicketResponse, { foreignKey: 'ticketId' });
Ticket.belongsToMany(Tag, { through: TicketTag, foreignKey: 'ticketId', as: 'tags' });
Ticket.hasMany(FileAttachment, { foreignKey: 'ticketId', as:'attachments' });

// Tag associations
Tag.belongsToMany(Ticket, { through: TicketTag, foreignKey: 'tagId', as: 'tickets' });
Tag.belongsToMany(Group, { through: GroupTag, foreignKey: 'tagId', as: 'groups' });

// Group associations
Group.belongsToMany(Tag, { through: GroupTag, foreignKey: 'groupId', as: 'tags' });
Group.belongsToMany(User, { through: GroupAgent, foreignKey: 'groupId', as: 'users' });

// TicketResponse associations
TicketResponse.belongsTo(Ticket, { foreignKey: 'ticketId' });
TicketResponse.belongsTo(User, { foreignKey: 'userId', as: 'user' });
TicketResponse.hasMany(FileAttachment, { foreignKey: 'responseId', as:'attachments'});

// FileAttachment associations
FileAttachment.belongsTo(Ticket, { foreignKey: 'ticketId' });
FileAttachment.belongsTo(TicketResponse, { foreignKey: 'responseId' });

module.exports = {
  User,
  Ticket,
  Tag,
  Group,
  SLAPolicy,
  TicketTag,
  GroupTag,
  GroupAgent,
  TicketResponse,
  FileAttachment
}; 