const express = require('express');
const router = express.Router();
const db = require('../../models');
const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');

// GET /categories - Categories management page (with product count, portable)
router.get('/', authJwt, isAdmin, async (req, res) => {
  try {
    const categories = await db.Category.findAll({
      attributes: [
        'id',
        'name',
        'imageUrl',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('products.id')), 'productsCount']
      ],
      include: [
        {
          model: db.Product,
          as: 'products',
          attributes: []
        }
      ],
      group: ['Category.id'],
      order: [['name', 'ASC']]
    });

    const plainCategories = categories.map(cat => cat.get({ plain: true }));

    res.render('categories', {
      layout: 'main',
      title: 'Categories Management',
      user: req.user,
      categories: plainCategories
    });
  } catch (err) {
    console.error('Error loading categories:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// GET /categories/add - Add Category form
router.get('/add', authJwt, isAdmin, (req, res) => {
  res.render('addCategory', {
    layout: 'main',
    title: 'Add Category',
    user: req.user
  });
});

// POST /categories/add - Handle add category
router.post('/add', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    await db.Category.create({ name, imageUrl });
    res.redirect('/categories');
  } catch (err) {
    console.error('Error adding category:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// GET /categories/:id/edit - Edit Category form
router.get('/:id/edit', authJwt, isAdmin, async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }
    res.render('editCategory', {
      layout: 'main',
      title: 'Edit Category',
      user: req.user,
      category: category.get({ plain: true })
    });
  } catch (err) {
    console.error('Error loading category:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// POST /categories/:id/edit - Handle edit category
router.post('/:id/edit', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }
    await category.update({ name, imageUrl });
    res.redirect('/categories');
  } catch (err) {
    console.error('Error editing category:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// POST /categories/:id/delete - Handle delete category
router.post('/:id/delete', authJwt, isAdmin, async (req, res) => {
  try {
    const category = await db.Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }
    await category.destroy();
    res.redirect('/categories');
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

module.exports = router;
