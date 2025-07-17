'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Products', 'stock', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0, // All existing products get stock = 0
    });
    await queryInterface.addColumn('Products', 'status', {
      type: Sequelize.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'inactive', // All existing products get status = 'inactive'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Products', 'stock');
    await queryInterface.removeColumn('Products', 'status');
  }
};
