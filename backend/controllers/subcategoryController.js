const subcategoryService = require('../services/subcategoryService');
const { Category } = require('../models');

// Get all subcategories (optionally include parent category)
exports.getAllSubCategories = async (req, res) => {
  try {
    const subcategories = await subcategoryService.getAllSubCategories({
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    res.json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    res.status(404).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
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
    res.status(400).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};
