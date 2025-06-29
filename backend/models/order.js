'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
    }
  }
  Order.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: { isIn: [['pending', 'processing', 'shipped', 'delivered', 'cancelled']] }
      },
      shippingAddress: { type: DataTypes.TEXT, allowNull: false },
      paymentMethod: { type: DataTypes.STRING, allowNull: false, defaultValue: 'cod' },
      phoneNumber: { type: DataTypes.STRING, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, validate: { isEmail: true } }
    },
    { sequelize, modelName: 'Order', tableName: 'Orders', timestamps: true }
  );
  return Order;
};
