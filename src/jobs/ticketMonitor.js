const { Ticket } = require('../models');
const { Op } = require('sequelize');

const checkAndCloseOverdueTickets = async () => {
  try {
    const now = new Date();
    const overdueTickets = await Ticket.findAll({
      where: {
        status: { [Op.ne]: 'closed' },
        responseDueDate: { [Op.lt]: now }
      }
    });

    for (const ticket of overdueTickets) {
      await ticket.update({ status: 'closed' });
      console.log(`Ticket ${ticket.id} has been automatically closed due to overdue response time`);
    }
  } catch (error) {
    console.error('Error in ticket monitoring job:', error);
  }
};

// Run the check every minute
setInterval(checkAndCloseOverdueTickets, 60000);

module.exports = {
  checkAndCloseOverdueTickets
}; 