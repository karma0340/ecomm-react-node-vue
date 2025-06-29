'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Orders
      User.hasMany(models.Order, { 
        foreignKey: 'userId', 
        as: 'orders' 
      });

      // User has many CartItems
      User.hasMany(models.CartItem, { 
        foreignKey: 'userId', 
        as: 'cartItems' 
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { 
          notEmpty: true,
          len: [3, 30]
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { 
          isEmail: true,
          notEmpty: true
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { 
          len: [6, 100]
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: [2, 50]
        }
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      paranoid: true, // Enables soft deletes (adds deletedAt column)
      indexes: [
        {
          unique: true,
          fields: ['email']
        },
        {
          unique: true,
          fields: ['username']
        }
      ]
    }
  );

  return User;
};
