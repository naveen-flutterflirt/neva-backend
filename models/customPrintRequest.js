const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CustomPrintRequest = sequelize.define(
  'CustomPrintRequest',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'request_id',
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'customer_name',
    },
    customerEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'customer_email',
    },
    customerPhone: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'customer_phone',
    },
    addressLine1: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'address_line_1',
    },
    addressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'address_line_2',
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    zipCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'zip_code',
    },
    deliveryInstructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'delivery_instructions',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'file_name',
    },
    fileSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '42.8 MB',
      field: 'file_size',
    },
    fileUrl: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'file_url',
    },
    material: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quality: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '6 Inch',
    },
    height: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '6 Inch',
    },
    infill: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 20,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quotePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'quote_price',
    },
    frontImage: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'front_image',
    },
    sideImage: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'side_image',
    },
    backImage: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
      field: 'back_image',
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending_review',
    },
  },
  {
    tableName: 'custom_print_requests',
    timestamps: true,
  }
);

module.exports = CustomPrintRequest;
