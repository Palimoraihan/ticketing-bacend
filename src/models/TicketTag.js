const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TicketTag = sequelize.define('TicketTag', {
  ticketId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Tickets',
      key: 'id'
    }
  },
  tagId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Tags',
      key: 'id'
    }
  }
});

module.exports = TicketTag; 