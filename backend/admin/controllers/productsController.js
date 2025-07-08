// backend/admin/controllers/productsController.js

const db = require('../../models');

// Helper: Get all categories and subcategories (for forms)
async function getCategoriesAndSubcategories() {
  const categories = await db.Category.findAll();
  const subcategories = await db.SubCategory.findAll();
  return { categories, subcategories };
}

// List all products (for admin products page)
exports.listProducts = async (req, res) => {
  try {
    const products = await db.Product.findAll({
      include: [
        { model: db.Category, as: 'category' },
        { model: db.SubCategory, as: 'subCategory' }
      ]
    });
    res.render('products', {
      layout: 'main',
      title: 'Product Management',
      user: req.user,
      products
    });
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
};

// Render add product form
exports.showAddForm = async (req, res) => {
  try {
    const { categories, subcategories } = await getCategoriesAndSubcategories();
    res.render('addProduct', {
      layout: 'main',
      title: 'Add Product',
      user: req.user,
      categories,
      subcategories
    });
  } catch (err) {
    console.error('Error rendering add product form:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
};

// Handle add product POST
exports.addProduct = async (req, res) => {
  try {
    const { name, price, imageUrl, categoryId, subCategoryId } = req.body;
    await db.Product.create({ name, price, imageUrl, categoryId, subCategoryId });
    res.redirect('/products');
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
};

// Render edit product form
exports.showEditForm = async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).render('404', { layout: 'main', title: 'Not Found', user: req.user });
    }
    const { categories, subcategories } = await getCategoriesAndSubcategories();
    res.render('editProduct', {
      layout: 'main',
      title: 'Edit Product',
      user: req.user,
      product,
      categories,
      subcategories
    });
  } catch (err) {
    console.error('Error rendering edit product form:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
};

// Handle edit product POST
exports.editProduct = async (req, res) => {
  try {
    const { name, price, imageUrl, categoryId, subCategoryId } = req.body;
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).render('404', { layout: 'main', title: 'Not Found', user: req.user });
    }
    await product.update({ name, price, imageUrl, categoryId, subCategoryId });
    res.redirect('/products');
  } catch (err) {
    console.error('Error editing product:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
};

// Handle delete product POST
exports.deleteProduct = async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).render('404', { layout: 'main', title: 'Not Found', user: req.user });
    }
    await product.destroy();
    res.redirect('/products');
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
};
