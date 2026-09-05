const { Order, OrderItem, sequelize } = require('../models');
const { Op } = require('sequelize');

const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

class OrderRepository {
  // Create Order with associated OrderItems in a Transaction
  async createOrder(orderData, itemsData) {
    const transaction = await sequelize.transaction();
    try {
      const order = await Order.create(orderData, { transaction });

      const itemsWithOrderId = itemsData.map(item => ({
        ...item,
        orderId: order.id,
      }));

      await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

      await transaction.commit();

      // Return created order with items
      return await this.getOrderById(order.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Get Order by Primary ID or Order Reference Number
  async getOrderById(id) {
    if (isUuid(id)) {
      const byPk = await Order.findByPk(id, {
        include: [{ model: OrderItem, as: 'items' }],
      });
      if (byPk) return byPk;
    }
    return await Order.findOne({
      where: { orderNumber: id },
      include: [{ model: OrderItem, as: 'items' }],
    });
  }

  // Get Order by Order Reference Number
  async getOrderByNumber(orderNumber) {
    return await Order.findOne({
      where: { orderNumber },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
    });
  }

  // Get All Orders with Filtering & Sorting
  async getAllOrders({ search, orderStatus, paymentStatus, email, userId, page = 1, limit = 50 }) {
    const where = {};

    if (userId && email) {
      where[Op.or] = [
        { userId: userId },
        { customerEmail: { [Op.iLike]: email.trim() } }
      ];
    } else if (userId) {
      where.userId = userId;
    } else if (email) {
      where.customerEmail = { [Op.iLike]: email.trim() };
    }

    if (orderStatus) {
      where.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where[Op.or] = [
        { orderNumber: { [Op.iLike]: `%${search}%` } },
        { customerName: { [Op.iLike]: `%${search}%` } },
        { customerPhone: { [Op.iLike]: `%${search}%` } },
        { customerEmail: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    const { rows, count } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      orders: rows,
      totalOrders: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  // Update Order Status
  async updateOrderStatus(id, orderStatus, trackingNumber = null) {
    let order = isUuid(id) ? await Order.findByPk(id) : null;
    if (!order) {
      order = await Order.findOne({ where: { orderNumber: id } });
    }
    if (!order) return null;

    const updateData = { orderStatus };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    if (orderStatus === 'delivered') {
      updateData.paymentStatus = 'paid';
    }

    await order.update(updateData);
    return await this.getOrderById(order.id);
  }

  // Update Payment Status
  async updatePaymentStatus(id, paymentStatus, razorpayPaymentId = null, razorpaySignature = null) {
    let order = isUuid(id) ? await Order.findByPk(id) : null;
    if (!order) {
      order = await Order.findOne({ where: { orderNumber: id } });
    }
    if (!order) return null;

    const updateData = { paymentStatus };
    if (razorpayPaymentId) updateData.razorpayPaymentId = razorpayPaymentId;
    if (razorpaySignature) updateData.razorpaySignature = razorpaySignature;

    await order.update(updateData);
    return await this.getOrderById(order.id);
  }
}

module.exports = new OrderRepository();
