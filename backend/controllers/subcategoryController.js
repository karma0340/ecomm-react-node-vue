const subcategoryService = require('../services/subcategoryService');
const { Category } = require('../models');

// Get all subcategories (optionally filtered by categoryId)
exports.getAllSubCategories = async (req, res) => {
  try {
    const options = {
      order: [['name', 'ASC']]
    };
    if (req.query.categoryId) {
      options.where = { categoryId: req.query.categoryId };
    }
    const subcategories = await subcategoryService.getAllSubCategories(options);
    // If you want to explicitly handle "no subcategories found"
    if (!subcategories || subcategories.length === 0) {
      return res.status(200).json([]); // Or: res.status(404).json({ error: 'No subcategories found' });
    }
    res.json(subcategories);
  } catch (err) {
    console.error('Error in getAllSubCategories:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch subcategories' });
  }
};

// Get a single subcategory by ID (with parent category)
exports.getSubCategory = async (req, res) => {
  try {
    const subcategory = await subcategoryService.getSubCategoryById(req.params.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json(subcategory);
  } catch (err) {
    console.error('Error in getSubCategory:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch subcategory' });
  }
};

// Create a new subcategory
exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields: name and categoryId' });
    }
    const subcategory = await subcategoryService.createSubCategory({ name, categoryId });
    res.status(201).json(subcategory);
  } catch (err) {
    console.error('Error in createSubCategory:', err);
    res.status(400).json({ error: err.message || 'Failed to create subcategory' });
  }
};

// Update a subcategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const subcategory = await subcategoryService.updateSubCategory(req.params.id, { name, categoryId });
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json(subcategory);
  } catch (err) {
    console.error('Error in updateSubCategory:', err);
    res.status(400).json({ error: err.message || 'Failed to update subcategory' });
  }
};

// Delete a subcategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const result = await subcategoryService.deleteSubCategory(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.json(result);
  } catch (err) {
    console.error('Error in deleteSubCategory:', err);
    res.status(500).json({ error: err.message || 'Failed to delete subcategory' });
  }
};
