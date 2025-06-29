const { Subcategory } = require('../models');

class SubcategoryService {
  async getAllSubCategories() {
    try {
      return await Subcategory.findAll();
    } catch (err) {
      throw new Error('Failed to fetch subcategories: ' + err.message);
    }
  }

  async getSubCategoryById(id) {
    try {
      const subcategory = await Subcategory.findByPk(id);
      if (!subcategory) throw new Error('Subcategory not found');
      return subcategory;
    } catch (err) {
      throw new Error('Failed to fetch subcategory: ' + err.message);
    }
  }

  async createSubCategory(data) {
    try {
      return await Subcategory.create(data);
    } catch (err) {
      throw new Error('Failed to create subcategory: ' + err.message);
    }
  }

  async updateSubCategory(id, data) {
    try {
      const subcategory = await Subcategory.findByPk(id);
      if (!subcategory) throw new Error('Subcategory not found');
      return await subcategory.update(data);
    } catch (err) {
      throw new Error('Failed to update subcategory: ' + err.message);
    }
  }

  async deleteSubCategory(id) {
    try {
      const subcategory = await Subcategory.findByPk(id);
      if (!subcategory) throw new Error('Subcategory not found');
      await subcategory.destroy();
      return { message: 'Subcategory deleted' };
    } catch (err) {
      throw new Error('Failed to delete subcategory: ' + err.message);
    }
  }
}

module.exports = new SubcategoryService();
