const subcategoryService = require('../services/subcategoryService');
const { Category } = require('../models');

// ✅ Get all subcategories (optionally filter by categoryId)
exports.getAllSubCategories = async (req, res) => {
  try {
    const options = {
      order: [['name', 'ASC']]
    };

    if (req.query.categoryId) {
      options.where = { categoryId: req.query.categoryId };
    }

    const subcategories = await subcategoryService.getAllSubCategories(options);

    if (!subcategories || subcategories.length === 0) {
      return res.status(200).json([]);
    }

    res.json(subcategories);
  } catch (err) {
    console.error('Error in getAllSubCategories:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch subcategories' });
  }
};

// ✅ Get a single subcategory by ID
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

// ✅ Create a new subcategory — supports image upload or imageUrl
exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId, imageUrl } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields: name and categoryId' });
    }

    // Check file upload or external URL
    const image = imageUrl?.trim() || (req.file ? `/uploads/subcategories/${req.file.filename}` : null);

    const subcategory = await subcategoryService.createSubCategory({ name, categoryId, imageUrl: image });

    return res.status(201).json(subcategory);
  } catch (err) {
    console.error('Error in createSubCategory:', err);
    res.status(400).json({ error: err.message || 'Failed to create subcategory' });
  }
};

// ✅ Update a subcategory — supports re-upload or replace with imageUrl
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, categoryId, imageUrl } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const image = imageUrl?.trim() || (req.file ? `/uploads/subcategories/${req.file.filename}` : undefined);

    const updated = await subcategoryService.updateSubCategory(req.params.id, {
      name,
      categoryId,
      ...(image !== undefined && { imageUrl: image })
    });

    if (!updated) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error in updateSubCategory:', err);
    res.status(400).json({ error: err.message || 'Failed to update subcategory' });
  }
};

// ✅ Delete subcategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const result = await subcategoryService.deleteSubCategory(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('Error in deleteSubCategory:', err);
    res.status(500).json({ error: err.message || 'Failed to delete subcategory' });
  }
};
