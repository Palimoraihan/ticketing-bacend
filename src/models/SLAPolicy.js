const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SLAPolicy = sequelize.define('SLAPolicy', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    unique: true
  },
  responseTime: {
    type: DataTypes.INTEGER, // in hours
    allowNull: false
  },
  resolutionTime: {
    type: DataTypes.INTEGER, // in hours
    allowNull: false
  }
});

module.exports = SLAPolicy; 