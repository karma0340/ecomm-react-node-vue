const db = require('../../models');

exports.createSubCategory = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Body not provided' });
    }

    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Name and Category are required' });
    }

    // Handle image via URL or file
    const imageUrl = req.body.imageUrl?.trim() ||
      (req.file ? `/uploads/subcategories/${req.file.filename}` : null);

    const subcategory = await db.SubCategory.create({
      name,
      categoryId,
      imageUrl
    });

    // Fetch category for response
    const category = await db.Category.findByPk(categoryId);

    // Respond with subcategory and Category
    return res.status(201).json({
      ...subcategory.toJSON(),
      Category: category
    });

  } catch (err) {
    console.error('❌ Error in createSubCategory:', err);
    return res.status(500).json({ error: 'Failed to create subcategory' });
  }
};


exports.updateSubCategory = async (req, res) => {
  try {
    const subcategory = await db.SubCategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'Name and Category are required' });
    }

    // Use new image if provided, else old
    const imageUrl = req.body.imageUrl?.trim() ||
      (req.file ? `/uploads/subcategories/${req.file.filename}` : subcategory.imageUrl);

    await subcategory.update({
      name,
      categoryId,
      imageUrl
    });

    // Fetch updated category
    const category = await db.Category.findByPk(categoryId);

    // Respond with updated subcategory and Category
    return res.json({
      ...subcategory.toJSON(),
      Category: category
    });

  } catch (err) {
    console.error('❌ Error updating subcategory:', err);
    return res.status(500).json({ error: 'Failed to update subcategory' });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id === 'undefined') {
      return res.status(400).json({ error: 'Invalid subcategory ID' });
    }

    const subcategory = await db.SubCategory.findByPk(id);

    if (!subcategory) {
      return res.status(404).json({ error: 'Subcategory not found' });
    }

    await subcategory.destroy();
    return res.sendStatus(204);

  } catch (err) {
    console.error('❌ Error deleting subcategory:', err);
    return res.status(500).json({ error: 'Failed to delete subcategory' });
  }
};
