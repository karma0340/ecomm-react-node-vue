const express = require('express');
const router = express.Router();
const db = require('../models'); // Adjust path as needed
const Fuse = require('fuse.js');

router.get('/search', async (req, res) => {
  const q = req.query.q ? req.query.q.trim() : '';

  // Helper: Decide if client wants JSON (e.g., React/Vue, AJAX) or HTML (.hbs)
  function wantsJSON(req) {
    return req.xhr || req.headers.accept && req.headers.accept.indexOf('application/json') > -1;
  }

  if (!q) {
    // If empty query, return empty results in preferred format
    if (wantsJSON(req)) {
      return res.json({ users: [], products: [] });
    }
    return res.render('searchResults', {
      title: 'Search',
      query: '',
      results: { users: [], products: [] }
    });
  }

  try {
    // Fetch all users & products. For large DBs, add .limit(500)!
    const [users, products] = await Promise.all([
      db.User.findAll({ raw: true }),
      db.Product.findAll({ raw: true })
    ]);

    // Fuzzy search for users
    const userFuse = new Fuse(users, {
      keys: ['name', 'email'],
      threshold: 0.38
    });
    const matchedUsers = userFuse.search(q).map(r => r.item);

    // Fuzzy search for products (only use keys that exist)
    const productFields = ['name', 'description'];
    if (products.length && products[0].category !== undefined) productFields.push('category');

    const productFuse = new Fuse(products, {
      keys: productFields,
      threshold: 0.38
    });
    const matchedProducts = productFuse.search(q).map(r => r.item);

    // Respond in preferred format
    if (wantsJSON(req)) {
      return res.json({ users: matchedUsers, products: matchedProducts });
    }
    return res.render('searchResults', {
      title: 'Search Results',
      query: q,
      results: { users: matchedUsers, products: matchedProducts }
    });
  } catch (err) {
    console.error('Search error:', err);
    if (wantsJSON(req)) {
      return res.status(500).json({ error: 'Server error', detail: err.message });
    }
    return res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user || null
    });
  }
});

module.exports = router;
