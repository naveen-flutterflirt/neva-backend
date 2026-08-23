const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST /api/orders - Create a new order
router.post('/', orderController.createOrder);

// GET /api/orders - Get all orders (with filters search/status)
router.get('/', orderController.getOrders);

// GET /api/orders/:id - Get single order by ID or orderNumber
router.get('/:id', orderController.getOrderById);

// PUT /api/orders/:id/status - Update order status (Admin)
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;
