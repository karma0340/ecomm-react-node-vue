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
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'SubCategories',
    timestamps: true
  });

  SubCategory.associate = function(models) {
    // NOTE: Use 'Category' as alias to match your frontend/route code!
    SubCategory.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'Category' });
    // Product association (leave as-is)
    SubCategory.hasMany(models.Product, { as: 'products', foreignKey: 'subCategoryId' });
  };

  return SubCategory;
};
