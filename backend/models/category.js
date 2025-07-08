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
    // Use the correct model name for SubCategory (case-sensitive!)
    Category.hasMany(models.SubCategory, { as: 'subcategories', foreignKey: 'categoryId' });
    Category.hasMany(models.Product, { as: 'products', foreignKey: 'categoryId' });
  };

  return Category;
};
