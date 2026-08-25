const express = require('express');
const multer = require('multer');
const router = express.Router();
const socialPostController = require('../controllers/socialPostController');

// Multer Memory Storage for AWS S3 Uploads (supports up to 100MB videos)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

// Routes
router.get('/', socialPostController.getSocialPosts);
router.post('/', upload.single('video'), socialPostController.createSocialPost);
router.put('/:id', upload.single('video'), socialPostController.updateSocialPost);
router.delete('/:id', socialPostController.deleteSocialPost);

module.exports = router;
