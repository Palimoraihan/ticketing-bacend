const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GroupTag = sequelize.define('GroupTag', {
  groupId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Groups',
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

module.exports = GroupTag; 