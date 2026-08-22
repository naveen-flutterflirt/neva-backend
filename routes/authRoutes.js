const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateUser = require('../middlewares/authMiddleware');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.get('/me', authenticateUser, authController.getMe);

module.exports = router;
