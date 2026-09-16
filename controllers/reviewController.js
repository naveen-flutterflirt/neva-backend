const { Review, Product } = require('../models');

// Helper to recalculate and update product rating
async function updateProductRating(productName) {
  if (!productName) return;
  try {
    const reviews = await Review.findAll({ where: { productName } });
    const reviewCount = reviews.length;
    let averageRating = 0.0;
    
    if (reviewCount > 0) {
      const sum = reviews.reduce((acc, rev) => acc + Number(rev.rating), 0);
      averageRating = (sum / reviewCount).toFixed(2);
    }
    
    await Product.update(
      { averageRating, reviewCount },
      { where: { name: productName } }
    );
  } catch (err) {
    console.error('Failed to update product rating:', err);
  }
}

class ReviewController {
  // Fetch reviews for a product (by ID or Name)
  async getReviews(req, res) {
    try {
      const { productId, productName, userId } = req.query;
      
      const whereClause = {};
      if (productId) whereClause.productId = String(productId);
      if (productName) whereClause.productName = productName;
      if (userId) whereClause.userId = userId;

      const reviews = await Review.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Create a new review
  async createReview(req, res) {
    try {
      const { productId, productName, userName, userId, rating, title, comment, images } = req.body;
      
      if (!productName || !rating || !comment) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }

      const review = await Review.create({
        productId: productId ? String(productId) : null,
        productName,
        userName: userName || 'Guest User',
        userId: userId || null,
        rating: Number(rating),
        title,
        comment,
        images: images || [],
        isVerifiedPurchase: true,
      });

      // Update Product averages
      await updateProductRating(productName);

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review,
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Update an existing review
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, title, comment, images } = req.body;
      
      const review = await Review.findByPk(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      await review.update({
        rating: rating ? Number(rating) : review.rating,
        title: title !== undefined ? title : review.title,
        comment: comment || review.comment,
        images: images || review.images,
      });

      // Update Product averages
      await updateProductRating(review.productName);

      res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
      });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  // Delete a review
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      
      const review = await Review.findByPk(id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Review not found' });
      }

      const productName = review.productName;
      await review.destroy();

      // Update Product averages
      await updateProductRating(productName);

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = new ReviewController();
