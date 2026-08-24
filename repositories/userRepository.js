const { Op } = require('sequelize');
const User = require('../models/user');

class UserRepository {
  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findByIdentifier(identifier) {
    return await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { contactNumber: identifier }
        ]
      }
    });
  }

  async findByPhone(phone) {
    return await User.findOne({
      where: {
        [Op.or]: [
          { contactNumber: phone },
          { whatsappNumber: phone }
        ]
      }
    });
  }

  async findById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }

  async createUser(userData) {
    return await User.create(userData);
  }

  async getCustomersWithOrders() {
    const { Order, OrderItem } = require('../models');

    // Fetch registered users with orders
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Order,
          as: 'orders',
          include: [{ model: OrderItem, as: 'items' }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Also fetch all orders to include guest checkouts & unlinked orders
    const allOrders = await Order.findAll({
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    });

    const userByIdMap = new Map();
    const userByEmailMap = new Map();

    users.forEach((u) => {
      const userObj = {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.contactNumber || u.whatsappNumber,
        whatsappNumber: u.whatsappNumber,
        role: u.role,
        createdAt: u.createdAt,
        orders: u.orders ? [...u.orders] : [],
      };

      userByIdMap.set(u.id, userObj);
      if (u.email) {
        userByEmailMap.set(u.email.toLowerCase(), userObj);
      }
    });

    allOrders.forEach((o) => {
      const oEmail = o.customerEmail ? o.customerEmail.toLowerCase() : '';

      // 1. Check direct userId match
      let matchedUser = o.userId ? userByIdMap.get(o.userId) : null;

      // 2. If no userId, check email match
      if (!matchedUser && oEmail) {
        matchedUser = userByEmailMap.get(oEmail);
        if (matchedUser && !o.userId) {
          o.update({ userId: matchedUser.id }).catch((err) =>
            console.warn('Auto backfill userId error:', err)
          );
        }
      }

      if (matchedUser) {
        const orderExists = matchedUser.orders.some((exOrder) => exOrder.id === o.id);
        if (!orderExists) {
          matchedUser.orders.push(o);
        }
      } else {
        const guestKey = `GUEST-${oEmail || o.customerPhone || o.id}`;
        if (!userByIdMap.has(guestKey)) {
          userByIdMap.set(guestKey, {
            id: `GUEST-${o.id.substring(0, 8)}`,
            name: o.customerName,
            email: o.customerEmail || 'Guest Order',
            phone: o.customerPhone,
            whatsappNumber: o.customerPhone,
            role: 'guest',
            createdAt: o.createdAt,
            orders: [o],
          });
        } else {
          const guestEntry = userByIdMap.get(guestKey);
          const orderExists = guestEntry.orders.some((exOrder) => exOrder.id === o.id);
          if (!orderExists) {
            guestEntry.orders.push(o);
          }
        }
      }
    });

    return Array.from(userByIdMap.values()).map((c) => {
      const totalSpent = c.orders.reduce((sum, ord) => sum + Number(ord.totalAmount || 0), 0);
      return {
        ...c,
        totalOrders: c.orders.length,
        totalSpent,
      };
    });
  }
}

module.exports = new UserRepository();
