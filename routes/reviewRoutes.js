const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// GET /api/reviews?productId=xxx or ?productName=xxx
router.get('/', reviewController.getReviews.bind(reviewController));

// POST /api/reviews
router.post('/', reviewController.createReview.bind(reviewController));

// PUT /api/reviews/:id
router.put('/:id', reviewController.updateReview.bind(reviewController));

// DELETE /api/reviews/:id
router.delete('/:id', reviewController.deleteReview.bind(reviewController));

module.exports = router;
