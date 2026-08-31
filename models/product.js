const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./category');

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Product name is required',
        },
      },
    },

    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'products_slug_unique',
        msg: 'Product slug must be unique',
      },
      validate: {
        notEmpty: {
          msg: 'Slug is required',
        },
      },
    },

    sku: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'products_sku_unique',
        msg: 'SKU must be unique',
      },
      validate: {
        notEmpty: {
          msg: 'SKU is required',
        },
      },
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: 'Price must be a decimal value',
        },
        min: {
          args: [0],
          msg: 'Price cannot be negative',
        },
      },
    },

    discountPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'discount_price',
      validate: {
        isDecimal: {
          msg: 'Discount price must be a decimal value',
        },
        min: {
          args: [0],
          msg: 'Discount price cannot be negative',
        },
      },
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        isInt: {
          msg: 'Stock must be an integer',
        },
        min: {
          args: [0],
          msg: 'Stock cannot be negative',
        },
      },
    },

    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: {
          args: [['draft', 'active', 'out_of_stock']],
          msg: "Status must be either 'draft', 'active', or 'out_of_stock'",
        },
      },
    },

    isNewArrival: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'is_new_arrival',
    },

    materialVariants: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'material_variants',
    },

    colorOptions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'color_options',
    },

    sizeVariants: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'size_variants',
    },

    careInstructions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'care_instructions',
    },

    keyFeatures: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: 'key_features',
    },

    specifications: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: 'specifications',
    },

    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'sort_order',
    },
    subCategoryId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'sub_category_id',
      references: {
        model: 'categories',
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
  },
  {
    tableName: 'products',
    timestamps: true,
  }
);

// Association setup
Product.belongsTo(Category, { as: 'category', foreignKey: 'categoryId' });
Category.hasMany(Product, { as: 'products', foreignKey: 'categoryId' });

Product.belongsTo(Category, { as: 'subCategory', foreignKey: 'subCategoryId' });
Category.hasMany(Product, { as: 'subCategoryProducts', foreignKey: 'subCategoryId' });

module.exports = Product;
