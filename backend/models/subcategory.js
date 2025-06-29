'use strict';
module.exports = (sequelize, DataTypes) => {
  const Subcategory = sequelize.define('Subcategory', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Categories', key: 'id' }
    }
  }, {
    tableName: 'SubCategories'
  });

  Subcategory.associate = function(models) {
    Subcategory.belongsTo(models.Category, { foreignKey: 'categoryId' });
    Subcategory.hasMany(models.Product, { as: 'products', foreignKey: 'subCategoryId' });
  };

  return Subcategory;
};
