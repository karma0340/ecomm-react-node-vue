'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
      OrderItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }
  OrderItem.init(
    {
      orderId: { type: DataTypes.INTEGER, allowNull: false },
      productId: { type: DataTypes.INTEGER, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      productName: { type: DataTypes.STRING, allowNull: false },
      productImage: { type: DataTypes.STRING }
    },
    { sequelize, modelName: 'OrderItem', tableName: 'OrderItems', timestamps: true }
  );
  return OrderItem;
};
