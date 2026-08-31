const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

// Calculate shipping fee route
router.get('/calculate-rate', shippingController.calculateRate.bind(shippingController));

module.exports = router;
