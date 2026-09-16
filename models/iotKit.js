const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IotKit = sequelize.define('IotKit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'discount_price',
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active',
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  whatsIncluded: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'whats_included',
  },
  projects: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  faqs: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
}, {
  tableName: 'iot_kits',
  timestamps: true,
});

module.exports = IotKit;
