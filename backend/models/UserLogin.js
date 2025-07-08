'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserLogin extends Model {
    static associate(models) {
      UserLogin.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }
  UserLogin.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    sequelize,
    modelName: 'UserLogin',
    tableName: 'UserLogins',
    timestamps: true // createdAt will be used!
  });
  return UserLogin;
};
