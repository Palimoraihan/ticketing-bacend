const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  responseDueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolutionDueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  agentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

// Add method to calculate due dates based on SLA
Ticket.calculateDueDates = async function(priority) {
  const SLAPolicy = require('./SLAPolicy');
  const slaPolicy = await SLAPolicy.findOne({ where: { priority } });
  
  if (!slaPolicy) {
    throw new Error(`No SLA policy found for priority: ${priority}`);
  }

  const now = new Date();
  const responseDueDate = new Date(now.getTime() + slaPolicy.responseTime * 60 * 60 * 1000);
  const resolutionDueDate = new Date(now.getTime() + slaPolicy.resolutionTime * 60 * 60 * 1000);

  return {
    responseDueDate,
    resolutionDueDate
  };
};

module.exports = Ticket; 