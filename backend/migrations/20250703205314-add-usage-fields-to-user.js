'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'usagePercent', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('Users', 'usagePeriod', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
    await queryInterface.addColumn('Users', 'usageColor', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'usagePercent');
    await queryInterface.removeColumn('Users', 'usagePeriod');
    await queryInterface.removeColumn('Users', 'usageColor');
  }
};
