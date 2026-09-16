const express = require('express');
const multer = require('multer');
const { createIotKit, getAllIotKits, getIotKitById, deleteIotKit, updateIotKit } = require('../controllers/iotKitController');

const router = express.Router();

// Configure multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
});

// Routes
router.post('/', upload.any(), createIotKit); // upload.any() allows dynamic field names like 'components_0_image'
router.get('/', getAllIotKits);
router.get('/:id', getIotKitById);
router.delete('/:id', deleteIotKit);
router.put('/:id', upload.any(), updateIotKit);

module.exports = router;
