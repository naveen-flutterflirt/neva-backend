const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Category name is required',
        },
      },
    },

    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'categories_slug_unique',
        msg: 'Slug must be unique',
      },
      validate: {
        notEmpty: {
          msg: 'Slug is required',
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'inactive']],
          msg: "Status must be either 'active' or 'inactive'",
        },
      },
    },


  },
  {
    tableName: 'categories',
    timestamps: true,
  }
);



module.exports = Category;
