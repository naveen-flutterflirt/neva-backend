const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const config = require('./config');
const app = express();
const PORT = config.port;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Express JSON SyntaxError Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid JSON payload format.' });
  }
  next();
});

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const customPrintRoutes = require('./routes/customPrintRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const socialPostRoutes = require('./routes/socialPostRoutes');

// Load models & associations
require('./models');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/custom-print', customPrintRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/social-posts', socialPostRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Auto-migrate schema: ensure address column exists on users table
    try {
      await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;');
    } catch (colErr) {
      console.log('Schema migration check:', colErr.message);
    }

    await sequelize.sync();
    console.log('Database models synced.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
