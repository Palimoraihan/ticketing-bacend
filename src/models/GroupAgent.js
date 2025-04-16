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
}, {
  tableName: 'groupagents'
});

// Define the association with Group
GroupAgent.associate = (models) => {
  GroupAgent.belongsTo(models.Group, {
    foreignKey: 'groupId',
    as: 'group'
  });
};

module.exports = GroupAgent; 