module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'shippingAddress', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    });
    await queryInterface.addColumn('Orders', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });
    await queryInterface.addColumn('Orders', 'paymentMethod', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'cod',
    });
    await queryInterface.addColumn('Orders', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'shippingAddress');
    await queryInterface.removeColumn('Orders', 'phoneNumber');
    await queryInterface.removeColumn('Orders', 'paymentMethod');
    await queryInterface.removeColumn('Orders', 'email');
  }
};
