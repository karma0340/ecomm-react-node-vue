'use strict';
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Categories', key: 'id' }
    },
subCategoryId: {
  type: DataTypes.INTEGER,
  allowNull: false,
  references: { model: 'SubCategories', key: 'id' } // Table name should match your migration/model
}
,
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    }
    // Add other fields as needed
  }, {
    tableName: 'Products', // Ensure table name is set if needed
    underscored: false,    // Set to true if you use snake_case in DB
    timestamps: true       // Set to false if you don't want createdAt/updatedAt
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    Product.belongsTo(models.SubCategory, { foreignKey: 'subCategoryId', as: 'subCategory' });
  };

  return Product;
};
