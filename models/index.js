const sequelize = require('../config/database');
const User = require('./user');
const Category = require('./category');
const Product = require('./product');
const ProductImage = require('./productImage');
const CustomPrintRequest = require('./customPrintRequest');
const Order = require('./order');
const OrderItem = require('./orderItem');
const SocialPost = require('./socialPost');

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Category parent-subcategory self-association
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });
Category.hasMany(Category, { as: 'subcategories', foreignKey: 'parentId' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  CustomPrintRequest,
  Order,
  OrderItem,
  SocialPost,
};
