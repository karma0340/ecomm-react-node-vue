const { Category } = require('../models');

class CategoryService {
  // Get all categories with pagination
  async getAllCategories({ offset = 0, limit = 5 } = {}) {
    try {
      // findAndCountAll returns { rows, count }
      return await Category.findAndCountAll({
        offset,
        limit,
        order: [['createdAt', 'DESC']]
      });
    } catch (err) {
      throw err;
    }
  }

  // Get a single category by ID
  async getCategoryById(id) {
    try {
      const category = await Category.findByPk(id);
      if (!category) throw new Error('Category not found');
      return category;
    } catch (err) {
      throw err;
    }
  }

  // Create a new category
  async createCategory(data) {
    try {
      if (!data.name) throw new Error('Category name is required');
      return await Category.create({
        name: data.name,
        imageUrl: data.imageUrl || null
      });
    } catch (err) {
      throw err;
    }
  }

  // Update an existing category
  async updateCategory(id, data) {
    try {
      const category = await Category.findByPk(id);
      if (!category) throw new Error('Category not found');
      return await category.update({
        name: data.name ?? category.name,
        imageUrl: data.imageUrl ?? category.imageUrl
      });
    } catch (err) {
      throw err;
    }
  }

  // Delete a category
  async deleteCategory(id) {
    try {
      const category = await Category.findByPk(id);
      if (!category) throw new Error('Category not found');
      await category.destroy();
      return { message: 'Category deleted' };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new CategoryService();
