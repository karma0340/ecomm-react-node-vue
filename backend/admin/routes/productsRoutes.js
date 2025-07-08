// backend/admin/routes/productsRoutes.js

const express = require('express');
const router = express.Router();
const db = require('../../models'); // Sequelize models index.js
const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');

// Helper: Get all categories and subcategories (for forms)
async function getCategoriesAndSubcategories() {
  const categories = await db.Category.findAll();
  const subcategories = await db.SubCategory.findAll();
  // Convert to plain objects for Handlebars
  return {
    categories: categories.map(c => c.get({ plain: true })),
    subcategories: subcategories.map(s => s.get({ plain: true }))
  };
}

// GET /products - Render product management page with products list
router.get('/', authJwt, isAdmin, async (req, res) => {
  try {
    const products = await db.Product.findAll({
      include: [
        { model: db.Category, as: 'category' },
        { model: db.SubCategory, as: 'subCategory' }
      ]
    });
    const categories = await db.Category.findAll();
    const subcategories = await db.SubCategory.findAll();

    // Convert Sequelize instances to plain JS objects
    const plainProducts = products.map(p => p.get({ plain: true }));
    const plainCategories = categories.map(c => c.get({ plain: true }));
    const plainSubcategories = subcategories.map(s => s.get({ plain: true }));

    res.render('products', {
      layout: 'main',
      title: 'Product Management',
      user: req.user,
      products: plainProducts,
      categories: plainCategories,
      subcategories: plainSubcategories
    });
  } catch (err) {
    console.error('Error loading products:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// GET /products/add - Render add product form
router.get('/add', authJwt, isAdmin, async (req, res) => {
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
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// POST /products/add - Handle add product submission
router.post('/add', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, price, imageUrl, categoryId, subCategoryId } = req.body;
    await db.Product.create({
      name,
      price,
      imageUrl,
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null
    });
    res.redirect('/products');
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// GET /products/:id/edit - Render edit product form
router.get('/:id/edit', authJwt, isAdmin, async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }

    const { categories, subcategories } = await getCategoriesAndSubcategories();

    res.render('editProduct', {
      layout: 'main',
      title: 'Edit Product',
      user: req.user,
      product: product.get({ plain: true }),
      categories,
      subcategories
    });
  } catch (err) {
    console.error('Error rendering edit product form:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// POST /products/:id/edit - Handle edit product submission
router.post('/:id/edit', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, price, imageUrl, categoryId, subCategoryId } = req.body;
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }

    await product.update({
      name,
      price,
      imageUrl,
      categoryId: categoryId || null,
      subCategoryId: subCategoryId || null
    });
    res.redirect('/products');
  } catch (err) {
    console.error('Error editing product:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// POST /products/:id/delete - Handle product deletion
router.post('/:id/delete', authJwt, isAdmin, async (req, res) => {
  try {
    const product = await db.Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }

    await product.destroy();
    res.redirect('/products');
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

module.exports = router;
