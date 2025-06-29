const { CartItem, Product } = require('../models');

class CartItemService {
  // Get all cart items for a user, including product details
  async getCartItems(userId) {
    return await CartItem.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product' }],
    });
  }

  // Add a product to cart or increase quantity if exists
  async addOrUpdateCartItem(userId, productId, quantity = 1) {
    const existingItem = await CartItem.findOne({ where: { userId, productId } });
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
      return existingItem;
    } else {
      return await CartItem.create({ userId, productId, quantity });
    }
  }

  // Update quantity of a cart item
  async updateCartItem(userId, cartItemId, quantity) {
    const cartItem = await CartItem.findOne({ where: { id: cartItemId, userId } });
    if (!cartItem) throw new Error('Cart item not found');
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    cartItem.quantity = quantity;
    await cartItem.save();
    return cartItem;
  }

  // Remove a cart item
  async removeCartItem(userId, cartItemId) {
    const cartItem = await CartItem.findOne({ where: { id: cartItemId, userId } });
    if (!cartItem) throw new Error('Cart item not found');
    await cartItem.destroy();
    return true;
  }

  // Clear all cart items for a user
  async clearCart(userId) {
    await CartItem.destroy({ where: { userId } });
    return true;
  }
}

module.exports = new CartItemService();
