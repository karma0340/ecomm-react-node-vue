const express = require('express');
const router = express.Router();
const db = require('../models');
const Wishlist = db.Wishlist;
const authenticate = require('../middleware/authJwt');

// ===============================
// POST /api/wishlist/items
// Add product to wishlist (for logged-in user)
// ===============================
router.post('/items', authenticate, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    const [item, created] = await Wishlist.findOrCreate({
      where: { user_id: userId, product_id: productId }
    });
    if (created) {
      res.json({ message: 'Added to wishlist!' });
    } else {
      res.json({ message: 'Already in wishlist.' });
    }
  } catch (err) {
    console.error('Wishlist add error:', err);
    res.status(500).json({ error: 'Failed to add to wishlist.' });
  }
});

// ===============================
// GET /api/wishlist/items
// Get all wishlist products for the logged-in user
// ===============================
router.get('/items', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    // Find all wishlist entries for the user
    const wishlistItems = await Wishlist.findAll({ where: { user_id: userId } });

    // Get all productIds in wishlist
    const productIds = wishlistItems.map(item => item.product_id);

    // Fetch product details for those IDs
    const products = await db.Product.findAll({
      where: { id: productIds }
      // Optionally: attributes: ['id', 'name', 'imageUrl', ...]
    });

    res.json(products); // Frontend expects an array of products
  } catch (err) {
    console.error('Wishlist fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist.' });
  }
});

// ===============================
// DELETE /api/wishlist/items/:productId
// Remove product from wishlist (for logged-in user)
// ===============================
router.delete('/items/:productId', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const deleted = await Wishlist.destroy({
      where: { user_id: userId, product_id: productId }
    });
    if (deleted) {
      res.json({ message: 'Removed from wishlist.' });
    } else {
      res.status(404).json({ error: 'Wishlist item not found.' });
    }
  } catch (err) {
    console.error('Wishlist remove error:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist.' });
  }
});

module.exports = router;
