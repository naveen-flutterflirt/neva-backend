
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const config = require('./config');
const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Load Models & Associations

require('./models');
// Routes

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const customPrintRoutes = require('./routes/customPrintRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const socialPostRoutes = require('./routes/socialPostRoutes');
const shippingRoutes = require('./routes/shippingRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/custom-print', customPrintRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/social-posts', socialPostRoutes);
app.use('/api/shipping', shippingRoutes);

// Test APIs

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working'
  });
});

app.post('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'POST API is working',
    data: req.body
  });
});


// Error Handling

// Invalid JSON payload handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON payload format.'
    });
  }

  next(err);
});

// Start Server

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync();
    console.log('Database models synced.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} `);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer();