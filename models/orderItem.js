const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'order_id',
    },
    productId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'product_id',
    },
    productName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'product_name',
    },
    productImage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'product_image',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'unit_price',
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'total_price',
    },
    selectedColor: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'selected_color',
    },
    selectedSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'selected_size',
    },
    selectedMaterial: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'selected_material',
    },
  },
  {
    tableName: 'order_items',
    timestamps: true,
    indexes: [
      {
        fields: ['order_id'],
      },
    ],
  }
);

module.exports = OrderItem;
