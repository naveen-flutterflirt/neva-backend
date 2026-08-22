const express = require('express');
const router = express.Router();
const customPrintController = require('../controllers/customPrintController');

// POST submit data
router.post('/', customPrintController.createCustomPrintRequest);

// GET fetch data for admin
router.get('/', customPrintController.getCustomPrintRequests);

// PUT update status or price quote
router.put('/:id', customPrintController.updateCustomPrintRequest);

// DELETE remove request
router.delete('/:id', customPrintController.deleteCustomPrintRequest);

module.exports = router;
