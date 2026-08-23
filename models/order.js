const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_number',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'user_id',
    },

    // Customer Info
    customerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'customer_name',
    },
    customerEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'customer_email',
    },
    customerPhone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'customer_phone',
    },

    // Shipping Address
    shippingAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'shipping_address',
    },
    addressType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'home',
      field: 'address_type',
    },

    // Financial Breakdown
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'discount_amount',
    },
    shippingFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'shipping_fee',
    },
    codFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'cod_fee',
    },
    gstTax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'gst_tax',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'total_amount',
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'coupon_code',
    },

    // Payment Integration Details
    paymentMethod: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'upi',
      field: 'payment_method',
    },
    paymentStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'pending',
      field: 'payment_status',
    },
    razorpayOrderId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'razorpay_order_id',
    },
    razorpayPaymentId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'razorpay_payment_id',
    },
    razorpaySignature: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'razorpay_signature',
    },

    // Order Fulfillment Status
    orderStatus: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'pending',
      field: 'order_status',
    },
    trackingNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'tracking_number',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'orders',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['order_number'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['payment_status'],
      },
      {
        fields: ['order_status'],
      },
    ],
  }
);

module.exports = Order;
