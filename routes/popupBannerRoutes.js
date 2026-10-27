const express = require('express');
const router = express.Router();
const popupBannerController = require('../controllers/popupBannerController');

// Public endpoint for store visitors
router.get('/active', popupBannerController.getActiveBanner);

// Admin endpoints
router.get('/', popupBannerController.getAllBanners);
router.post('/', popupBannerController.saveBanner);
router.delete('/:id', popupBannerController.deleteBanner);

module.exports = router;
