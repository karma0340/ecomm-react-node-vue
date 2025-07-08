const { CartItem, Product } = require('../models');

class CartItemService {
  async getCartItems(userId) {
    return await CartItem.findAll({
      where: { userId },
      include: [{ model: Product, as: 'product' }],
    });
  }

  async addOrUpdateCartItem(userId, productId, quantity = 1) {
    return await CartItem.sequelize.transaction(async (t) => {
      const [cartItem, created] = await CartItem.findOrCreate({
        where: { userId, productId },
        defaults: { quantity },
        transaction: t,
      });

      if (!created) {
        cartItem.quantity += quantity;
        await cartItem.save({ transaction: t });
      }

      return await CartItem.findOne({
        where: { id: cartItem.id },
        include: [{ model: Product, as: 'product' }],
        transaction: t,
      });
    });
  }

  async updateCartItem(userId, cartItemId, quantity) {
    if (quantity < 1) throw new Error('Quantity must be at least 1');
    const cartItem = await CartItem.findOne({ where: { id: cartItemId, userId } });
    if (!cartItem) throw new Error('Cart item not found');
    cartItem.quantity = quantity;
    await cartItem.save();
    return await CartItem.findOne({
      where: { id: cartItem.id },
      include: [{ model: Product, as: 'product' }]
    });
  }

  async removeCartItem(userId, cartItemId) {
    const cartItem = await CartItem.findOne({ where: { id: cartItemId, userId } });
    if (!cartItem) throw new Error('Cart item not found');
    await cartItem.destroy();
    return true;
  }

  async clearCart(userId) {
    await CartItem.destroy({ where: { userId } });
    return true;
  }
}

module.exports = new CartItemService();
