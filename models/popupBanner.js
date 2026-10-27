const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PopupBanner = sequelize.define(
  'PopupBanner',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'Special Deal of the Day!',
    },
    subtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Limited time offer on featured hardware',
    },
    badgeText: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Flash Deal 🔥',
      field: 'badge_text',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'product_id',
    },
    customDiscountPercentage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'custom_discount_percentage',
    },
    couponCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'coupon_code',
    },
    buttonText: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Claim Offer & Buy Now',
      field: 'button_text',
    },
    targetUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'target_url',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
  },
  {
    tableName: 'popup_banners',
    timestamps: true,
    underscored: true,
  }
);

module.exports = PopupBanner;
