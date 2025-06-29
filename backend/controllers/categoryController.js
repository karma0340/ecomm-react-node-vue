const categoryService = require('../services/categoryService');
const path = require('path');

// Get all categories with pagination
exports.getAllCategories = async (req, res) => {
  try {
    // Get page and limit from query, default to 5 per page
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    // Get paginated categories from service
    const { rows, count } = await categoryService.getAllCategories({ offset, limit });

    res.json({
      categories: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single category by ID
exports.getCategory = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

// Create a new category (with optional image upload)
exports.createCategory = async (req, res) => {
  try {
    let data = { ...req.body };
    if (req.file) {
      // File upload via Multer: store local path
      data.imageUrl = `/images/categories/${req.file.filename}`;
    }
    // If imageUrl is provided in body, store it as-is (remote URL)
    const category = await categoryService.createCategory(data);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a category (with optional image upload)
exports.updateCategory = async (req, res) => {
  try {
    let data = { ...req.body };
    if (req.file) {
      data.imageUrl = `/images/categories/${req.file.filename}`;
    }
    // If imageUrl is provided in body, store it as-is (remote URL)
    const category = await categoryService.updateCategory(req.params.id, data);
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
