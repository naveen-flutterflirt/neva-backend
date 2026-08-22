const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Product = require('./product');

const ProductImage = sequelize.define(
  'ProductImage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    imageUrl: {
      type: DataTypes.STRING(512),
      allowNull: false,
      field: 'image_url',
      validate: {
        notEmpty: {
          msg: 'Image URL is required',
        },
      },
    },

    isPrimary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_primary',
    },

    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },

    mediaType: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'image',
      field: 'media_type',
      validate: {
        isIn: {
          args: [['image', 'video']],
          msg: "Media type must be either 'image' or 'video'"
        }
      }
    },

    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'color',
    },
  },
  {
    tableName: 'product_images',
    timestamps: true,
  }
);

// Association setup
Product.hasMany(ProductImage, { as: 'images', foreignKey: 'productId', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { as: 'product', foreignKey: 'productId' });

module.exports = ProductImage;
