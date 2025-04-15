const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FileAttachment = sequelize.define('FileAttachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false
  },
  originalname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mimetype: {
    type: DataTypes.STRING,
    allowNull: false
  },
  size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Tickets',
      key: 'id'
    }
  },
  responseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'TicketResponses',
      key: 'id'
    }
  }
}, {
  tableName: 'fileattachments'
});

module.exports = FileAttachment; 