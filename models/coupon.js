const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define(
  'Coupon',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      set(val) {
        if (val) this.setDataValue('code', val.trim().toUpperCase());
      },
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    // 'percentage' or 'flat'
    discountType: {
      type: DataTypes.ENUM('percentage', 'flat'),
      allowNull: false,
      defaultValue: 'percentage',
      field: 'discount_type',
    },
    discountValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'discount_value',
    },
    // Maximum discount cap in rupees (for percentage coupons)
    maxDiscountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'max_discount_amount',
    },
    // Minimum cart subtotal required to apply
    minOrderAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      field: 'min_order_amount',
    },
    // 'all' or 'new_customer'
    applicableUser: {
      type: DataTypes.ENUM('all', 'new_customer'),
      allowNull: false,
      defaultValue: 'all',
      field: 'applicable_user',
    },
    // Overall usage limit across all users
    usageLimitTotal: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'usage_limit_total',
    },
    // How many times one user can use it
    usageLimitPerUser: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      field: 'usage_limit_per_user',
    },
    // Counter of how many times it was used
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'used_count',
    },
    // Whether to show in public list on Cart/Checkout
    showInPublicList: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'show_in_public_list',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'start_date',
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'end_date',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'coupons',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Coupon;
