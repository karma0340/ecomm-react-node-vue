'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Use Sequelize.TEXT('long') for LONGTEXT in MySQL
    await queryInterface.changeColumn('SubCategories', 'imageUrl', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Roll back to VARCHAR(255)
    await queryInterface.changeColumn('SubCategories', 'imageUrl', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  }
};
