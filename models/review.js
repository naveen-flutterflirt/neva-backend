const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  productId: {
    type: DataTypes.STRING, // Depending on if your product ID is UUID or string/integer
    allowNull: true, 
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false, // For associating via product name since Orders track productName
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Guest User',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    },
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  images: {
    type: DataTypes.JSON, // Array of strings (image URLs)
    allowNull: true,
  },
  isVerifiedPurchase: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Assuming if they are reviewing from profile page, it's verified
  },
}, {
  timestamps: true,
});

module.exports = Review;
