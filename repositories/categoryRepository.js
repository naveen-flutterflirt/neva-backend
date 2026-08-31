const Category = require('../models/category');

class CategoryRepository {
  async findAll() {
    return await Category.findAll({
      include: [
        {
          model: Category,
          as: 'subcategories',
          attributes: ['id', 'name', 'slug', 'parentId']
        }
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id) {
    return await Category.findByPk(id);
  }

  async findBySlug(slug) {
    return await Category.findOne({
      where: { slug }
    });
  }

  async create(categoryData) {
    return await Category.create(categoryData);
  }

  async update(id, categoryData) {
    const category = await Category.findByPk(id);
    if (!category) {
      return null;
    }
    return await category.update(categoryData);
  }

  async delete(id) {
    const category = await Category.findByPk(id);
    if (!category) {
      return false;
    }
    await category.destroy();
    return true;
  }
}

module.exports = new CategoryRepository();
