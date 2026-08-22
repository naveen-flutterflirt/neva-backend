const Product = require('../models/product');
const ProductImage = require('../models/productImage');
const Category = require('../models/category');

class ProductRepository {
  async findAll() {
    return await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'sortOrder', 'mediaType', 'color'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id) {
    return await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'sortOrder', 'mediaType', 'color'],
        },
      ],
    });
  }

  async findBySlug(slug) {
    return await Product.findOne({
      where: { slug },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'isPrimary', 'sortOrder', 'mediaType', 'color'],
        },
      ],
    });
  }

  async findBySku(sku) {
    return await Product.findOne({ where: { sku } });
  }

  async create(productData) {
    return await Product.create(productData);
  }

  async update(id, productData) {
    const product = await Product.findByPk(id);
    if (!product) {
      return null;
    }
    return await product.update(productData);
  }

  async delete(id) {
    const product = await Product.findByPk(id);
    if (!product) {
      return false;
    }
    await product.destroy(); // ProductImages will cascade delete automatically due to model configuration
    return true;
  }

  // Image Helper Methods
  async createImages(imagesData) {
    return await ProductImage.bulkCreate(imagesData);
  }

  async deleteImage(imageId) {
    const img = await ProductImage.findByPk(imageId);
    if (!img) return false;
    await img.destroy();
    return true;
  }

  async clearPrimaryImages(productId) {
    return await ProductImage.update(
      { isPrimary: false },
      { where: { productId } }
    );
  }

  async setPrimaryImage(imageId) {
    const img = await ProductImage.findByPk(imageId);
    if (!img) return null;
    
    // Clear all other primaries first
    await this.clearPrimaryImages(img.productId);
    
    return await img.update({ isPrimary: true });
  }
}

module.exports = new ProductRepository();
