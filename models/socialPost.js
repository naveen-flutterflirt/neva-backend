const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SocialPost = sequelize.define(
  'SocialPost',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'Nivashop Video Showcase',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'social_posts',
    timestamps: true,
  }
);

module.exports = SocialPost;
