const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const verifyToken = require('../middleware/authJwt'); // JWT authentication middleware

// Apply authentication middleware to ALL cart routes
router.use(verifyToken);

// Define cart routes
router.post('/', cartController.addToCart);           // Add item to cart
router.get('/', cartController.getCart);              // Get user's cart
router.put('/:id', cartController.updateCartItem);    // Update item quantity
router.delete('/:id', cartController.removeCartItem); // Remove single item
router.delete('/', cartController.clearCart);          // Clear entire cart

module.exports = router;
