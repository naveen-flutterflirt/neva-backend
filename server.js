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

// for testing 
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend is working'
  });
});

// Dummy POST API
app.post('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'POST API is working',
    data: req.body
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Auto-migrate schema: ensure address column exists on users table & is_new_arrival on products table
    try {
      await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;');
      await sequelize.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT false;');
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


DATABASE_URL=postgresql://neondb_owner:npg_92dFteILXQqH@ep-polished-leaf-axxvocjx-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
PORT=5050
JWT_SECRET=neva_ecommerce_super_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@nivashop.in
ADMIN_PASSWORD=Niva@Admin2026

#AWS S3 for Photo
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAVL2QW4BO5E4M736G
AWS_SECRET_ACCESS_KEY=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
AWS_S3_BUCKET=neva-ecommerce

# Payment Integration 
RAZORPAY_KEY_ID=rzp_test_TSnKuVgteVheGX
RAZORPAY_KEY_SECRET=ON7wJdzn7mp1CDUEjF5jtbej

# SMTP Email Configuration (For Sending Replies)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=info@flutterflirt.com
SMTP_PASS=xmtwhgvpzqtgztnc
SMTP_FROM=<info@flutterflirt.com> 
