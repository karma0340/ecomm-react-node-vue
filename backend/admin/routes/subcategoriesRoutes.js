const express = require('express');
const router = express.Router();
const db = require('../../models');
const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');

// GET /subcategories - Subcategories management page with category and product count
router.get('/', authJwt, isAdmin, async (req, res) => {
  try {
    const subcategories = await db.SubCategory.findAll({
      attributes: [
        'id',
        'name',
        'categoryId',
        [db.Sequelize.fn('COUNT', db.Sequelize.col('products.id')), 'productsCount']
      ],
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: db.Product,
          as: 'products',
          attributes: []
        }
      ],
      group: ['SubCategory.id', 'category.id'],
      order: [['name', 'ASC']]
    });

    const plainSubcategories = subcategories.map(sub => sub.get({ plain: true }));

    res.render('subcategories', {
      layout: 'main',
      title: 'Subcategories Management',
      user: req.user,
      subcategories: plainSubcategories
    });
  } catch (err) {
    console.error('Error loading subcategories:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// GET /subcategories/add - Add Subcategory form
router.get('/add', authJwt, isAdmin, async (req, res) => {
  try {
    const categories = await db.Category.findAll({ attributes: ['id', 'name'] });
    res.render('addSubcategory', {
      layout: 'main',
      title: 'Add Subcategory',
      user: req.user,
      categories: categories.map(c => c.get({ plain: true }))
    });
  } catch (err) {
    console.error('Error loading categories for subcategory add:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// POST /subcategories/add - Handle add subcategory
router.post('/add', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    await db.SubCategory.create({ name, categoryId });
    res.redirect('/subcategories');
  } catch (err) {
    console.error('Error adding subcategory:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// GET /subcategories/:id/edit - Edit Subcategory form
router.get('/:id/edit', authJwt, isAdmin, async (req, res) => {
  try {
    const subcategory = await db.SubCategory.findByPk(req.params.id, {
      include: [{ model: db.Category, as: 'category', attributes: ['id', 'name'] }]
    });
    if (!subcategory) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }
    const categories = await db.Category.findAll({ attributes: ['id', 'name'] });
    res.render('editSubcategory', {
      layout: 'main',
      title: 'Edit Subcategory',
      user: req.user,
      subcategory: subcategory.get({ plain: true }),
      categories: categories.map(c => c.get({ plain: true }))
    });
  } catch (err) {
    console.error('Error loading subcategory:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// POST /subcategories/:id/edit - Handle edit subcategory
router.post('/:id/edit', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const subcategory = await db.SubCategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }
    await subcategory.update({ name, categoryId });
    res.redirect('/subcategories');
  } catch (err) {
    console.error('Error editing subcategory:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// POST /subcategories/:id/delete - Handle delete subcategory
router.post('/:id/delete', authJwt, isAdmin, async (req, res) => {
  try {
    const subcategory = await db.SubCategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }
    await subcategory.destroy();
    res.redirect('/subcategories');
  } catch (err) {
    console.error('Error deleting subcategory:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

module.exports = router;
