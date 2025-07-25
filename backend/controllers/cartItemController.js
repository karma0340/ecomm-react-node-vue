
const cartItemService = require('../services/cartItemService');

// Get all cart items for the current user (with product details)
exports.getCart = async (req, res) => {
  try {
    const cartItems = await cartItemService.getCartItems(req.user.id);
    res.json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get cart items' });
  }
};

// Add a product to cart (or increase quantity if already exists)

exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });
    const qty = quantity && quantity > 0 ? quantity : 1;
    const cartItem = await cartItemService.addOrUpdateCartItem(req.user.id, productId, qty);
    res.status(201).json(cartItem);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to add to cart' });
  }
};

// Update quantity of a specific cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1' });
    const cartItem = await cartItemService.updateCartItem(req.user.id, req.params.cartItemId, quantity);
    res.json(cartItem);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update cart item' });
  }
};

// Remove a specific cart item
exports.removeCartItem = async (req, res) => {
  try {
    await cartItemService.removeCartItem(req.user.id, req.params.cartItemId);
    res.json({ message: 'Cart item removed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to remove cart item' });
  }
};

// Clear all cart items for the current user
exports.clearCart = async (req, res) => {
  try {
    await cartItemService.clearCart(req.user.id);
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to clear cart' });
  }
};
