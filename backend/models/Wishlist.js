// models/Wishlist.js
module.exports = (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    timestamps: true,
    indexes: [{ unique: true, fields: ['user_id', 'product_id'] }]
  });
  return Wishlist;
};
