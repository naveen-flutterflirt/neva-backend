const express = require('express');
const multer = require('multer');
const { createIotKit, getAllIotKits, getIotKitById, deleteIotKit, updateIotKit } = require('../controllers/iotKitController');

const router = express.Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit per file for eBooks & images
});

const handleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File is too large. Maximum file size allowed is 100MB.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// Routes
router.post('/', handleUpload, createIotKit);
router.get('/', getAllIotKits);
router.get('/:id', getIotKitById);
router.delete('/:id', deleteIotKit);
router.put('/:id', handleUpload, updateIotKit);

module.exports = router;
