require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, Ticket, Tag, Group, SLAPolicy, TicketResponse, TicketTag, GroupTag, GroupAgent } = require('./src/models');

async function initializeDatabase() {
  try {
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database tables created successfully.');

    // Create initial admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created:', admin.toJSON());

    // Create initial tags
    const tags = await Tag.bulkCreate([
      { name: 'Technical', description: 'Technical issues' },
      { name: 'Billing', description: 'Billing related issues' },
      { name: 'General', description: 'General inquiries' }
    ]);
    console.log('Initial tags created:', tags.map(tag => tag.toJSON()));

    // Create initial SLA policies
    const slaPolicies = await SLAPolicy.bulkCreate([
      { priority: 'low', responseTime: 24, resolutionTime: 72 },
      { priority: 'medium', responseTime: 12, resolutionTime: 48 },
      { priority: 'high', responseTime: 4, resolutionTime: 24 },
      { priority: 'critical', responseTime: 1, resolutionTime: 8 }
    ]);
    console.log('SLA policies created:', slaPolicies.map(policy => policy.toJSON()));

    console.log('Database initialization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 