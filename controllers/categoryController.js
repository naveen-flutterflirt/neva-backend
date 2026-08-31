const categoryRepository = require('../repositories/categoryRepository');
const Product = require('../models/product');

// Helper to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

class CategoryController {
  async getCategories(req, res) {
    try {
      const categories = await categoryRepository.findAll();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve categories',
        error: error.message,
      });
    }
  }

  async getCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await categoryRepository.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: error.message,
    });
  }
}

  async createCategory(req, res) {
  try {
    const { name, slug, description, status, parentId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const finalSlug = slug ? generateSlug(slug) : generateSlug(name);

    // Verify unique slug
    const existing = await categoryRepository.findBySlug(finalSlug);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category slug '${finalSlug}' already exists`,
      });
    }

    const category = await categoryRepository.create({
      name,
      slug: finalSlug,
      description,
      status: status || 'active',
      parentId: parentId || null
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message,
    });
  }
}

  async updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, description, status, parentId } = req.body;

    const category = await categoryRepository.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const updateData = {};
    if (name) updateData.name = name;

    if (slug) {
      updateData.slug = generateSlug(slug);
      // Verify unique slug if it changed
      if (updateData.slug !== category.slug) {
        const existing = await categoryRepository.findBySlug(updateData.slug);
        if (existing) {
          return res.status(400).json({
            success: false,
            message: `Category slug '${updateData.slug}' already exists`,
          });
        }
      }
    } else if (name && !category.slug) {
      updateData.slug = generateSlug(name);
    }

    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (parentId !== undefined) updateData.parentId = parentId || null;


    const updated = await categoryRepository.update(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message,
    });
  }
}

  async deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Delete associated products first to avoid RESTRICT foreign key violations
    await Product.destroy({ where: { categoryId: id } });

    const deleted = await categoryRepository.delete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Category and associated products deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message,
    });
  }
}
}

module.exports = new CategoryController();
