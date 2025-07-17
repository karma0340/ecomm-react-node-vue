const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Middleware
const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');
const getUpload = require('../../middleware/upload');
const upload = getUpload('subcategories');

// Controllers
const db = require('../../models');
const subcategoryController = require('../controllers/subcategoryController');

// ========== SSR: Render Subcategory List ==========
router.get('/', authJwt, isAdmin, async (req, res) => {
  try {
    const subcategories = await db.SubCategory.findAll({
      include: [{ model: db.Category, as: 'Category', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    });

    const categories = await db.Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
      raw: true
    });

    const manifestPath = path.join(__dirname, '../../dist/manifest.json');
    const manifest = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      : {};

    const vueFile =
      manifest['src/vue-subcategories.js']?.file ||
      manifest['./src/vue-subcategories.js']?.file;

    res.render('subcategories', {
      layout: 'main',
      title: 'Manage Subcategories',
      vueScript: vueFile ? `/dist/${vueFile}` : null,
      user: req.user,
      subcategories,
      categories,
    });

  } catch (err) {
    console.error('❌ Error loading subcategories:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});


// ========== API ROUTES (used by Vue component) ✅ ==========

// POST /api/subcategories – Create via API (support file & imageUrl)
router.post(
  '/',
  authJwt,
  isAdmin,
  upload.single('image'),
  async (req, res) => {
    // call controller
    await subcategoryController.createSubCategory(req, {
      status: function (code) { this._status = code; return this; },
      json: async function (obj) {
        // If response is standard subcategory (no Category), fetch Category
        if (obj && obj.id && !obj.Category) {
          // Fetch with Category (not 'category') for Vue table
          const record = await db.SubCategory.findByPk(obj.id, { include: { model: db.Category, as: 'Category', attributes: ['id', 'name'] } });
          if (record) return res.json(record);
        }
        return res.json(obj);
      }
    });
  }
);

// PUT /api/subcategories/:id – Update via API
router.put(
  '/:id',
  authJwt,
  isAdmin,
  upload.single('image'),
  async (req, res) => {
    // call controller
    await subcategoryController.updateSubCategory(req, {
      status: function (code) { this._status = code; return this; },
      json: async function (obj) {
        if (obj && obj.id && !obj.Category) {
          // Fetch with Category for Vue table
          const record = await db.SubCategory.findByPk(obj.id, { include: { model: db.Category, as: 'Category', attributes: ['id', 'name'] } });
          if (record) return res.json(record);
        }
        return res.json(obj);
      }
    });
  }
);

// DELETE /api/subcategories/:id – Delete via API
router.delete(
  '/:id',
  authJwt,
  isAdmin,
  subcategoryController.deleteSubCategory
);


// ========== LEGACY SSR ROUTES (HBS FORM BASED) ==========

// Render Add Subcategory Form
router.get('/add', authJwt, isAdmin, async (req, res) => {
  try {
    const categories = await db.Category.findAll({
      attributes: ['id', 'name'],
      raw: true
    });

    res.render('addSubcategory', {
      layout: 'main',
      title: 'Add Subcategory',
      user: req.user,
      categories
    });

  } catch (err) {
    console.error('❌ Error loading add form:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});

// Handle Add Subcategory submission (HBS)
router.post('/add', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res.status(400).render('500', {
        layout: 'main',
        user: req.user,
        title: 'Missing Fields'
      });
    }

    await db.SubCategory.create({ name, categoryId });
    res.redirect('/subcategories');

  } catch (err) {
    console.error('❌ Error adding subcategory:', err);
    res.status(500).render('500', {
      layout: 'main',
      user: req.user,
      title: 'Server Error'
    });
  }
});

// Render Edit form (SSR)
router.get('/:id/edit', authJwt, isAdmin, async (req, res) => {
  try {
    const subcategory = await db.SubCategory.findByPk(req.params.id, {
      include: [{ model: db.Category, as: 'Category', attributes: ['id', 'name'] }]
    });

    if (!subcategory) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Subcategory Not Found',
        user: req.user
      });
    }

    const categories = await db.Category.findAll({ attributes: ['id', 'name'], raw: true });

    res.render('editSubcategory', {
      layout: 'main',
      title: 'Edit Subcategory',
      user: req.user,
      subcategory: subcategory.get({ plain: true }),
      categories
    });

  } catch (err) {
    console.error('❌ Error loading edit form:', err);
    res.status(500).render('500', { layout: 'main', user: req.user, title: 'Server Error' });
  }
});

// Handle Edit Submission (HBS)
router.post('/:id/edit', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    const subcategory = await db.SubCategory.findByPk(req.params.id);

    if (!subcategory) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Subcategory Not Found',
        user: req.user
      });
    }

    await subcategory.update({ name, categoryId });
    res.redirect('/subcategories');

  } catch (err) {
    console.error('❌ Error updating subcategory:', err);
    res.status(500).render('500', { layout: 'main', user: req.user, title: 'Server Error' });
  }
});

// Handle Delete Subcategory (HBS)
router.post('/:id/delete', authJwt, isAdmin, async (req, res) => {
  try {
    const subcategory = await db.SubCategory.findByPk(req.params.id);
    if (!subcategory) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Subcategory Not Found',
        user: req.user
      });
    }

    await subcategory.destroy();
    res.redirect('/subcategories');

  } catch (err) {
    console.error('❌ Error deleting subcategory:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});

module.exports = router;
