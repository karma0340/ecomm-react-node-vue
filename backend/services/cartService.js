const { CartItem, Product, sequelize } = require('../models');

class CartService {
  // Add a product to the cart (or increase quantity if exists)
  async addToCart(userId, productId, quantity = 1) {
    return await sequelize.transaction(async (t) => {
      // Use findOrCreate to avoid race conditions and unique constraint errors
      const [cartItem, created] = await CartItem.findOrCreate({
        where: { userId, productId },
        defaults: { quantity },
        transaction: t
      });

      // If the item already existed, update its quantity
      if (!created) {
        cartItem.quantity += quantity;
        await cartItem.save({ transaction: t });
      }

      // Return the cart item with product details
      return await CartItem.findOne({
        where: { id: cartItem.id },
        include: [{ model: Product, as: 'product' }],
        transaction: t
      });
    });
  }

  // Get all cart items for a user (with product details)
  async getCart(userId) {
    try {
      return await CartItem.findAll({
        where: { userId },
        include: [{ model: Product, as: 'product' }]
      });
    } catch (err) {
      throw new Error(err.message || 'Failed to fetch cart');
    }
  }

  // Update quantity of a cart item (by cartItemId)
  async updateCartItem(userId, cartItemId, quantity) {
    try {
      const cartItem = await CartItem.findOne({ where: { id: cartItemId, userId } });
      if (!cartItem) throw new Error('Cart item not found');
      if (quantity < 1) throw new Error('Quantity must be at least 1');
      cartItem.quantity = quantity;
      await cartItem.save();
      // Return updated item with product details
      return await CartItem.findOne({
        where: { id: cartItem.id },
        include: [{ model: Product, as: 'product' }]
      });
    } catch (err) {
      throw new Error(err.message || 'Failed to update cart item');
    }
  }

  // Remove a cart item (by cartItemId)
  async removeCartItem(userId, cartItemId) {
    try {
      const cartItem = await CartItem.findOne({ where: { id: cartItemId, userId } });
      if (!cartItem) throw new Error('Cart item not found');
      await cartItem.destroy();
      return { message: 'Item removed from cart' };
    } catch (err) {
      throw new Error(err.message || 'Failed to remove cart item');
    }
  }

  // Clear all cart items for a user
  async clearCart(userId) {
    try {
      await CartItem.destroy({ where: { userId } });
      return { message: 'Cart cleared successfully' };
    } catch (err) {
      throw new Error(err.message || 'Failed to clear cart');
    }
  }
}

module.exports = new CartService();
