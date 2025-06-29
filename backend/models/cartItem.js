'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // CartItem belongs to User
      CartItem.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      // CartItem belongs to Product
      CartItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
    }
  }

  CartItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: { min: 1 },
      },
    },
    {
      sequelize,
      modelName: 'CartItem',
      tableName: 'CartItems',
      timestamps: true,
      paranoid: true, // optional: soft deletes
      indexes: [
        {
          unique: true,
          fields: ['userId', 'productId','deletedAt'], // prevent duplicate product entries per user
        },
      ],
    }
  );

  return CartItem;
};
