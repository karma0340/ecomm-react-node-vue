const cartService = require('../services/cartService');

// Add a product to the cart (or increase quantity)
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    const cartItem = await cartService.addToCart(userId, productId, quantity || 1);
    res.status(201).json(cartItem);
  } catch (err)
  {console.log("err--",err)
    res.status(400).json({ error: err.message });
    
  }
};

// Get all cart items for the user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCart(userId);
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update quantity of a cart item (by cartItemId)
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: cartItemId } = req.params; // cartItemId from URL
    const { quantity } = req.body;
    const cartItem = await cartService.updateCartItem(userId, cartItemId, quantity);
    res.json(cartItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove a cart item (by cartItemId)
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: cartItemId } = req.params; // cartItemId from URL
    await cartService.removeCartItem(userId, cartItemId);
    res.json({ message: 'Cart item removed successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Clear the entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await cartService.clearCart(userId);
    res.json({ message: 'Cart cleared successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
