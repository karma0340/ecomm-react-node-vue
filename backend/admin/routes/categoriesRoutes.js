const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../../models'); // Sequelize models
const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');

const manifestPath = path.join(__dirname, '../../dist/manifest.json');

// GET /admin/categories → SSR render with Vue & Data
router.get('/', authJwt, isAdmin, async (req, res) => {
  try {
    // ✅ Read manifest.json to get Vue script file
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    }

    const vueFile =
      manifest['src/vue-categories.js']?.file ||
      manifest['./src/vue-categories.js']?.file;

    if (!vueFile) {
      console.warn('⚠️ vue-categories.js not found in manifest.json');
    }

    // ✅ Fetch categories from DB
    const categories = await db.Category.findAll({
      order: [['createdAt', 'DESC']],
      raw: true // Essential to avoid Sequelize model instances (makes JSON serializable)
    });

    // ✅ Render HBS + Inject categories + Vue script
    res.render('categories', {
      layout: 'main',
      title: 'Manage Categories',
      user: req.user || null,
      vueScript: `/dist/${vueFile}`,
      categories // passed to HBS – available for <script> window data
    });

  } catch (err) {
    console.error('❌ Error rendering categories page:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user || null
    });
  }
});

module.exports = router;
