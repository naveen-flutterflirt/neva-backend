const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Public customer routes
router.get('/public', couponController.getPublicCoupons);
router.post('/validate', couponController.validateCoupon);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, couponController.getAllCoupons);
router.post('/', authMiddleware, adminMiddleware, couponController.createCoupon);
router.put('/:id', authMiddleware, adminMiddleware, couponController.updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, couponController.deleteCoupon);

module.exports = router;
