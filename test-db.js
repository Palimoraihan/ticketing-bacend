require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Test creating tables
    await sequelize.sync({ force: false });
    console.log('Database tables synchronized successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

testConnection(); 