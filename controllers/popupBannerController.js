const { PopupBanner, Product, ProductImage, Category } = require('../models');

class PopupBannerController {
  // Get active public popup banners for store visitors (returns array for carousel support)
  async getActiveBanner(req, res) {
    try {
      const banners = await PopupBanner.findAll({
        where: { isActive: true },
        order: [['updatedAt', 'DESC']],
        include: [
          {
            model: Product,
            as: 'product',
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'imageUrl', 'isPrimary'],
              },
              {
                model: Category,
                as: 'category',
                attributes: ['id', 'name', 'slug'],
              },
            ],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: banners, // Array of active banners for carousel
      });
    } catch (error) {
      console.error('Failed to get active popup banner:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve active popup banner',
        error: error.message,
      });
    }
  }

  // Get all popup banners for Admin
  async getAllBanners(req, res) {
    try {
      const banners = await PopupBanner.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price', 'discountPrice', 'sku', 'slug'],
            include: [
              {
                model: ProductImage,
                as: 'images',
                attributes: ['id', 'imageUrl', 'isPrimary'],
              },
            ],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        data: banners,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve banners',
        error: error.message,
      });
    }
  }

  // Create or Update single active banner
  async saveBanner(req, res) {
    try {
      const {
        id,
        title,
        subtitle,
        badgeText,
        productId,
        customDiscountPercentage,
        couponCode,
        buttonText,
        targetUrl,
        isActive,
      } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Banner title is required',
        });
      }

      // If this banner is set to active, deactivate others so only 1 active banner is shown
      if (isActive) {
        await PopupBanner.update({ isActive: false }, { where: {} });
      }

      let banner;
      if (id) {
        banner = await PopupBanner.findByPk(id);
        if (!banner) {
          return res.status(404).json({ success: false, message: 'Banner not found' });
        }
        await banner.update({
          title,
          subtitle,
          badgeText,
          productId: productId || null,
          customDiscountPercentage: customDiscountPercentage ? parseInt(customDiscountPercentage, 10) : null,
          couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
          buttonText: buttonText || 'Claim Offer & Buy Now',
          targetUrl,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        });
      } else {
        banner = await PopupBanner.create({
          title,
          subtitle,
          badgeText,
          productId: productId || null,
          customDiscountPercentage: customDiscountPercentage ? parseInt(customDiscountPercentage, 10) : null,
          couponCode: couponCode ? couponCode.trim().toUpperCase() : null,
          buttonText: buttonText || 'Claim Offer & Buy Now',
          targetUrl,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        });
      }

      const refreshed = await PopupBanner.findByPk(banner.id, {
        include: [
          {
            model: Product,
            as: 'product',
            include: [{ model: ProductImage, as: 'images' }],
          },
        ],
      });

      return res.status(200).json({
        success: true,
        message: 'Popup banner saved successfully',
        data: refreshed,
      });
    } catch (error) {
      console.error('Save popup banner error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save popup banner',
        error: error.message,
      });
    }
  }

  // Delete banner
  async deleteBanner(req, res) {
    try {
      const { id } = req.params;
      const banner = await PopupBanner.findByPk(id);
      if (!banner) {
        return res.status(404).json({ success: false, message: 'Banner not found' });
      }
      await banner.destroy();
      return res.status(200).json({
        success: true,
        message: 'Popup banner deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete banner',
        error: error.message,
      });
    }
  }
}

module.exports = new PopupBannerController();
