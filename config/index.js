require('dotenv').config();
module.exports = {
  port: parseInt(process.env.PORT, 10),
  databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : null,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
};
