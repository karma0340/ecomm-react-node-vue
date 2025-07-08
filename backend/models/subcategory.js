'use strict';
module.exports = (sequelize, DataTypes) => {
  const SubCategory = sequelize.define('SubCategory', {
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

  SubCategory.associate = function(models) {
    SubCategory.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    SubCategory.hasMany(models.Product, { as: 'products', foreignKey: 'subCategoryId' });
  };

  return SubCategory;
};
