'use strict';

const express = require('express');
const router = express.Router();
const Fuse = require('fuse.js'); // Fuzzy search
const db = require('../models'); // Adjust path if needed
const { Op } = require('sequelize');

// ===== isAdmin Middleware =====
function isAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  return res.status(403).render('adminLogin', {
    layout: 'main',
    title: 'Admin Login',
    isAdminLogin: true,
    error: 'You must be an authenticated admin to view this page.'
  });
}

// ===== Admin Panel Views (SSR) =====
const productWebRoutes = require('../admin/routes/productAdminRoutes');
const orderWebRoutes = require('../admin/routes/ordersRoutes');
const categoryWebRoutes = require('../admin/routes/categoriesRoutes');
const subcategoryWebRoutes = require('../admin/routes/subcategoriesRoutes');
const userWebRoutes = require('../admin/routes/userAdminRoutes');

router.use('/products', isAdmin, productWebRoutes);
router.use('/orders', isAdmin, orderWebRoutes);
router.use('/categories', isAdmin, categoryWebRoutes);
router.use('/subcategories', isAdmin, subcategoryWebRoutes);
router.use('/users', isAdmin, userWebRoutes);

// ===== /admin Root Redirect =====
router.get('/', (req, res) => {
  return req.session?.user?.role === 'admin'
    ? res.redirect('/admin/dashboard')
    : res.redirect('/admin/login');
});

// ===== Fuzzy Search Implementation =====
router.get('/search', async (req, res) => {
  const q = req.query.q?.trim() || '';
  if (!q) {
    return res.render('searchResults', { title: 'Search', query: '', results: { users: [], products: [] } });
  }
  try {
    // Fetch all for in-memory filtering (add .limit(N) for huge DBs)
    const [users, products] = await Promise.all([
      db.User.findAll({ raw: true }),
      db.Product.findAll({ raw: true })
    ]);

    // USERS fuzzy search
    const userFuse = new Fuse(users, {
      keys: ['name', 'email'],
      threshold: 0.38,
    });
    const fuzzyUsers = q ? userFuse.search(q).map(r => r.item) : [];

    // PRODUCTS fuzzy search
    const productFuse = new Fuse(products, {
      keys: ['name', 'description', 'category'],
      threshold: 0.38,
    });
    const fuzzyProducts = q ? productFuse.search(q).map(r => r.item) : [];

    res.render('searchResults', {
      title: 'Search Results',
      query: q,
      results: { users: fuzzyUsers, products: fuzzyProducts }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.session.user });
  }
});

// ===== 404 Handler (for this router) =====
router.use((req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).render('404', {
      layout: 'main',
      title: 'Not Found',
      user: req.session.user
    });
  }
  return res.status(404).json({ error: 'API endpoint not found' });
});

module.exports = router;
