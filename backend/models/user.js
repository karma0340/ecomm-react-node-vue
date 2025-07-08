'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has many Orders
      User.hasMany(models.Order, { foreignKey: 'userId', as: 'orders' });

      // User has many CartItems
      User.hasMany(models.CartItem, { foreignKey: 'userId', as: 'cartItems' });

      // User has one Payment
      User.hasOne(models.Payment, { foreignKey: 'userId', as: 'payment' });

      // User has many Activities (for activity feed)
      User.hasMany(models.Activity, { foreignKey: 'userId', as: 'activities' });
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
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: 'Username is required' },
          len: { args: [3, 30], msg: 'Username must be 3-30 characters' }
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Must be a valid email' },
          notEmpty: { msg: 'Email is required' }
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: { args: [6, 100], msg: 'Password must be at least 6 characters' }
        },
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: true,
        validate: {
          len: { args: [2, 50], msg: 'Name must be 2-50 characters' }
        }
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        allowNull: false,
        defaultValue: 'user'
      },
      // --- Add these fields for password reset ---
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      paranoid: true, // Enables soft deletes (adds deletedAt column)
      indexes: [
        { unique: true, fields: ['email'] },
        { unique: true, fields: ['username'] }
      ]
    }
  );

  return User;
};
