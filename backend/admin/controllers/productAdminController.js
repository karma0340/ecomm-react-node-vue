const fs = require('fs');
const path = require('path');
const db = require('../../models');

const distDir = path.join(__dirname, '..', '..', 'dist');
const manifestPath = path.join(distDir, 'manifest.json');

// Helper for SSR: resolves the path to your Vue build bundle
function getVueScript() {
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    let entry = manifest['src/vue-products.js'] || manifest['./src/vue-products.js'];
    if (!entry) {
      entry = Object.values(manifest).find(val =>
        val.file && /^vue-products.*\.js$/.test(val.file)
      );
    }
    if (entry && entry.file) return '/admin/dist/' + entry.file;
    console.error('[SSR /products] ERROR: No vue-products entry found in manifest.');
  } else {
    console.error('[SSR /products] ERROR: Manifest file does not exist at', manifestPath);
  }
  return '/admin/dist/vue-products.js';
}

// Helper to get categories and subcategories for forms
async function getCategoriesAndSubcategories() {
  const categories = await db.Category.findAll();
  const subcategories = await db.SubCategory.findAll();
  return { categories, subcategories };
}

// ===================== SSR product management page ======================
exports.listProducts = async (req, res) => {
  try {
    const products = await db.Product.findAll({
      include: [
        { model: db.Category, as: 'category', attributes: ['id', 'name'] },
        { model: db.SubCategory, as: 'subCategory', attributes: ['id', 'name'] }
      ]
    });
    const { categories, subcategories } = await getCategoriesAndSubcategories();
    const vueScript = getVueScript();

    res.render('products', {
      layout: 'main',
      title: 'Product Management',
      user: req.user,
      products: products || [],
      categories: categories || [],
      subcategories: subcategories || [],
      vueScript
    });
  } catch (err) {
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
};

// --- Utility: safe field normalization for product CRUD ---
function normalizeProductFields(obj) {
  const safeValue = val => (typeof val === 'string' && val.trim() === '') ? null : val;
  return {
    name: safeValue(obj.name),
    price: ('' + obj.price).trim() === '' ? null : Number(obj.price),
    imageUrl: safeValue(obj.imageUrl),
    categoryId: safeValue(obj.categoryId),
    subCategoryId: safeValue(obj.subCategoryId),
    stock: ('' + obj.stock).trim() === '' ? 0 : Number(obj.stock),
    status: safeValue(obj.status) || 'active'
  };
}

// ===================== API for Vue admin panel ===========================

// GET /admin/products/api  -- list all products with associations (no pagination, you can add if wanted)
exports.apiListProducts = async (req, res) => {
  try {
    const products = await db.Product.findAll({
      include: [
        { model: db.Category, as: 'category', attributes: ['id', 'name'] },
        { model: db.SubCategory, as: 'subCategory', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(products || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load products.' });
  }
};

// POST /admin/products/api
exports.apiAddProduct = async (req, res) => {
  try {
    let payload = normalizeProductFields(req.body);
    if (req.file && req.file.filename) {
      payload.imageUrl = `/images/products/${req.file.filename}`;
    }
    if (!payload.name || payload.price == null || !payload.categoryId) {
      return res.status(400).json({ error: 'Missing required fields (name, price, categoryId).' });
    }
    payload.status = payload.status || 'active';

    const product = await db.Product.create(payload);

    const productFull = await db.Product.findByPk(product.id, {
      include: [
        { model: db.Category, as: 'category', attributes: ['id', 'name'] },
        { model: db.SubCategory, as: 'subCategory', attributes: ['id', 'name'] }
      ]
    });
    res.status(201).json(productFull);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to add product.' });
  }
};

// PUT /admin/products/api/:id
exports.apiEditProduct = async (req, res) => {
  try {
    const id = req.params.id;
    let payload = normalizeProductFields(req.body);
    if (req.file && req.file.filename) {
      payload.imageUrl = `/images/products/${req.file.filename}`;
    }
    payload.status = payload.status || 'active';
    if (!payload.name || payload.price == null || !payload.categoryId) {
      return res.status(400).json({ error: 'Missing required fields (name, price, categoryId).' });
    }
    const product = await db.Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    // Update only the allowed fields, including stock!
    await product.update(payload);

    const productFull = await db.Product.findByPk(product.id, {
      include: [
        { model: db.Category, as: 'category', attributes: ['id', 'name'] },
        { model: db.SubCategory, as: 'subCategory', attributes: ['id', 'name'] }
      ]
    });
    res.json(productFull);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to edit product.' });
  }
};

// DELETE /admin/products/api/:id
exports.apiDeleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await db.Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete product.' });
  }
};
