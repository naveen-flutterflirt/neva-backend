const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
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
          msg: 'Name is required',
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters',
        },
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'users_email_unique',
        msg: 'Email address already in use',
      },
      validate: {
        notEmpty: {
          msg: 'Email is required',
        },
        isEmail: {
          msg: 'Please provide a valid email address',
        },
      },
    },

    whatsappNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: 'whatsapp_number',
      validate: {
        notEmpty: {
          msg: 'WhatsApp number is required',
        },
        is: {
          args: /^[6-9]\d{9}$/,
          msg: 'Please provide a valid WhatsApp number',
        },
      },
    },

    contactNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      field: 'contact_number',
      validate: {
        notEmpty: {
          msg: 'Contact number is required',
        },
        is: {
          args: /^[6-9]\d{9}$/,
          msg: 'Please provide a valid contact number',
        },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Password is required',
        },
      },
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '',
    },

    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'customer',
      validate: {
        isIn: {
          args: [['customer', 'admin']],
          msg: "Role must be either 'customer' or 'admin'",
        },
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,

    indexes: [
      {
        unique: true,
        fields: ['email'],
      },
    ],
  }
);

module.exports = User;