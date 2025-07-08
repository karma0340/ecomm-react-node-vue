'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Each Payment belongs to a User
      Payment.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Payment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' }
      },
      method: {
        type: DataTypes.STRING,
        allowNull: false,
        // Example: 'Mastercard', 'Visa', 'PayPal', etc.
      },
      iconClass: {
        type: DataTypes.STRING,
        allowNull: false,
        // Example: 'cib-cc-mastercard', 'cib-cc-visa', etc.
      }
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'Payments',
      timestamps: true,
    }
  );

  return Payment;
};
