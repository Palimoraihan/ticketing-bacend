const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GroupAgent = sequelize.define('GroupAgent', {
  groupId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Groups',
      key: 'id'
    }
  },
  agentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = GroupAgent; 