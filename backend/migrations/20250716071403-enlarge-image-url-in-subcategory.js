'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Increase length to 1000
    return queryInterface.changeColumn('SubCategories', 'imageUrl', {
      type: Sequelize.STRING(1000),
      allowNull: true
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Revert to 255 if needed
    return queryInterface.changeColumn('SubCategories', 'imageUrl', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  }
};
