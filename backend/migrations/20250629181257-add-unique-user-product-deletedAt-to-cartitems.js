module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the old unique constraint if it exists
    await queryInterface.removeConstraint('CartItems', 'cart_items_user_id_product_id').catch(() => {});
    // Add the new unique constraint including deletedAt
    await queryInterface.addConstraint('CartItems', {
      fields: ['userId', 'productId', 'deletedAt'],
      type: 'unique',
      name: 'cart_items_user_id_product_id_deletedAt_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the new constraint
    await queryInterface.removeConstraint('CartItems', 'cart_items_user_id_product_id_deletedAt_unique');
    // (Optional) Add back the old constraint if needed
    await queryInterface.addConstraint('CartItems', {
      fields: ['userId', 'productId'],
      type: 'unique',
      name: 'cart_items_user_id_product_id'
    });
  }
};
