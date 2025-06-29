const express = require('express');
const router = express.Router();
const cartItemController = require('../controllers/cartItemController');
const verifyToken = require('../middleware/authJwt'); // Adjust path if needed

// Protect all cart item routes
router.use(verifyToken);

// Get all cart items for current user
router.get('/', cartItemController.getCart);

// Add product to cart
router.post('/', cartItemController.addToCart);

// Update quantity of a cart item
router.put('/:cartItemId', cartItemController.updateCartItem);

// Remove a cart item
router.delete('/:cartItemId', cartItemController.removeCartItem);

// Clear entire cart
router.delete('/', cartItemController.clearCart);

module.exports = router;
