'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'name', {
      type: Sequelize.STRING,
      allowNull: true // or false if you want it required
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'name');
  }
};
