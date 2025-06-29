'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {});
  Category.associate = function(models) {
    Category.hasMany(models.Subcategory, { as: 'subcategories', foreignKey: 'categoryId' });
    Category.hasMany(models.Product, { as: 'products', foreignKey: 'categoryId' });
  };
  return Category;
};
