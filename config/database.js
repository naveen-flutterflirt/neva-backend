const { Sequelize } = require('sequelize');
const config = require('./index');

if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is not defined in the environment variables.');
}

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  dialectModule: require('pg'),
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false, // Set to console.log to see query logs
  pool: {
    max: 10,
    min: 2,
    acquire: 60000, // 60 seconds
    idle: 30000
  }
});

module.exports = sequelize;
