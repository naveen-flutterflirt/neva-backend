const orderRepository = require('../repositories/orderRepository');

class OrderController {
  // POST /api/orders - Create New Order
  async createOrder(req, res) {
    try {
      const {
        orderId,
        items,
        customer,
        payment,
        pricing,
        notes,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order items are required.',
        });
      }

      if (!customer || !customer.name || !customer.phone || !customer.address) {
        return res.status(400).json({
          success: false,
          message: 'Customer name, phone, and address are required.',
        });
      }

      const generatedOrderNumber = orderId || `NIVA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      let resolvedUserId = req.user ? req.user.id : (req.body.userId || null);
      if (!resolvedUserId && (customer.email || customer.phone)) {
        try {
          const userRepository = require('../repositories/userRepository');
          const foundUser = await userRepository.findByIdentifier(customer.email || customer.phone);
          if (foundUser) {
            resolvedUserId = foundUser.id;
          }
        } catch (e) {
          console.warn('User lookup for order creation skipped:', e);
        }
      }

      const orderData = {
        orderNumber: generatedOrderNumber,
        userId: resolvedUserId,
        customerName: customer.name,
        customerEmail: customer.email || null,
        customerPhone: customer.phone,
        shippingAddress: customer.address,
        addressType: customer.addressType || 'home',

        subtotal: pricing?.subtotal || 0,
        discountAmount: pricing?.discount || 0,
        shippingFee: pricing?.shipping || 0,
        codFee: pricing?.codFee || 0,
        gstTax: pricing?.gstTax || 0,
        totalAmount: pricing?.total || 0,
        couponCode: pricing?.couponCode || null,

        paymentMethod: payment?.method || 'upi',
        paymentStatus: payment?.status === 'Paid via Razorpay' || payment?.status === 'Paid (Online Instant)' || payment?.status === 'Paid' ? 'paid' : 'pending',
        razorpayOrderId: payment?.razorpayOrderId || null,
        razorpayPaymentId: payment?.razorpayPaymentId || null,
        razorpaySignature: payment?.razorpaySignature || null,

        orderStatus: 'pending',
        notes: notes || null,
      };

      const itemsData = items.map(item => ({
        productId: String(item.id || item.productId || ''),
        productName: item.name || item.productName || 'Product',
        productImage: item.image || item.productImage || null,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.price || item.unitPrice) || 0,
        totalPrice: (Number(item.price || item.unitPrice) || 0) * (Number(item.quantity) || 1),
        selectedColor: item.selectedColor || null,
        selectedSize: item.selectedSize || null,
        selectedMaterial: item.selectedMaterial || null,
      }));

      const createdOrder = await orderRepository.createOrder(orderData, itemsData);

      return res.status(201).json({
        success: true,
        message: 'Order created successfully! 📦',
        data: createdOrder,
      });
    } catch (error) {
      console.error('Create Order Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create order.',
      });
    }
  }

  // GET /api/orders - Get All Orders
  async getOrders(req, res) {
    try {
      const { search, orderStatus, paymentStatus, email, userId, page, limit } = req.query;

      const result = await orderRepository.getAllOrders({
        search,
        orderStatus,
        paymentStatus,
        email,
        userId,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 50,
      });

      return res.status(200).json({
        success: true,
        data: result.orders,
        pagination: {
          totalOrders: result.totalOrders,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
      });
    } catch (error) {
      console.error('Get Orders Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch orders.',
      });
    }
  }

  // GET /api/orders/:id - Get Order By ID or Order Number
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      let order = await orderRepository.getOrderById(id);
      if (!order) {
        order = await orderRepository.getOrderByNumber(id);
      }

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }

      return res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error('Get Order By ID Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch order details.',
      });
    }
  }

  // PUT /api/orders/:id/status - Update Order Status
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { orderStatus, trackingNumber } = req.body;

      if (!orderStatus) {
        return res.status(400).json({
          success: false,
          message: 'Order status is required.',
        });
      }

      const updatedOrder = await orderRepository.updateOrderStatus(id, orderStatus, trackingNumber);

      if (!updatedOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }

      // 📧 Send email notification to customer if customerEmail exists (non-blocking)
      if (updatedOrder.customerEmail) {
        const { sendOrderStatusEmail } = require('../utils/mailer');
        sendOrderStatusEmail(updatedOrder.customerEmail, {
          orderNumber: updatedOrder.orderNumber,
          customerName: updatedOrder.customerName,
          orderStatus: updatedOrder.orderStatus,
          trackingNumber: updatedOrder.trackingNumber,
          totalAmount: updatedOrder.totalAmount,
          shippingAddress: updatedOrder.shippingAddress,
          items: updatedOrder.items || [],
        }).catch((emailErr) => {
          console.error('⚠️ Async Order Status Email Error:', emailErr.message || emailErr);
        });
      }

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${orderStatus}!`,
        data: updatedOrder,
      });
    } catch (error) {
      console.error('Update Order Status Controller Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update order status.',
      });
    }
  }
}

module.exports = new OrderController();
