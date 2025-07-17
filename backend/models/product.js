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
      allowNull: true, // allow null for optional subcategory
      references: { model: 'SubCategories', key: 'id' }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      allowNull: false,
      defaultValue: 'inactive'
    }
    // Add other fields as needed
  }, {
    tableName: 'Products',
    underscored: false,
    timestamps: true
  });

  Product.associate = function(models) {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
    Product.belongsTo(models.SubCategory, {
      foreignKey: 'subCategoryId',
      as: 'subCategory'
    });
    Product.hasMany(models.OrderItem, {
      foreignKey: 'productId',
      as: 'orderItems'
    });
  };

  return Product;
};
