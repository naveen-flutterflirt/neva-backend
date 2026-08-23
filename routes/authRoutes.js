const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateUser = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticateUser, authController.getMe);
router.put('/profile', authenticateUser, authController.updateProfile);
router.get('/customers', authController.getCustomers);

module.exports = router;
