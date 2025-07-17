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
  }, {
    tableName: 'Categories',
    timestamps: true
  });

  Category.associate = function(models) {
    Category.hasMany(models.SubCategory, { as: 'subcategories', foreignKey: 'categoryId' });
    Category.hasMany(models.Product, { as: 'products', foreignKey: 'categoryId' });
  };

  return Category;
};
