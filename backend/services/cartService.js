const { CartItem, Product, sequelize } = require('../models');

class CartService {
  // Add a product to the cart (or increase quantity if exists)
  async addToCart(userId, productId, quantity = 1) {
    return await sequelize.transaction(async (t) => {
      let cartItem = await CartItem.findOne({
        where: { userId, productId },
        transaction: t
      });

      if (cartItem) {
        cartItem.quantity += quantity;
        await cartItem.save({ transaction: t });
      } else {
        try {
          cartItem = await CartItem.create({ userId, productId, quantity }, { transaction: t });
        } catch (err) {
          // If unique constraint error, try to update instead (in case of race condition)
          if (err.name === 'SequelizeUniqueConstraintError') {
            cartItem = await CartItem.findOne({
              where: { userId, productId },
              transaction: t
            });
            if (cartItem) {
              cartItem.quantity += quantity;
              await cartItem.save({ transaction: t });
            } else {
              // Defensive: still not found, throw a meaningful error
              throw new Error('Cart item could not be found or created after unique constraint error');
            }
          } else {
            throw err;
          }
        }
      }

      // Optionally include product details in response
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
