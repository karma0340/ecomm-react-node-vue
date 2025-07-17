'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn('SubCategories', 'imageUrl', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('SubCategories', 'imageUrl');
  }
};
