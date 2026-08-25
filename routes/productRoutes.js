const express = require('express');
const multer = require('multer');
const router = express.Router();
const productController = require('../controllers/productController');

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB upload limit to support videos
  },
});

const mediaUpload = upload.fields([
  { name: 'images' },
  { name: 'videos' },
  { name: 'colorImages' }
]);

router.get('/', productController.getProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/:id', productController.getProduct);
router.post('/', mediaUpload, productController.createProduct);
router.put('/:id', mediaUpload, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
