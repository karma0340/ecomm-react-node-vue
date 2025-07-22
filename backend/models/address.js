// Sequelize Example
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    pincode: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    landmark: DataTypes.STRING,
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
  Address.associate = (models) => {
    Address.belongsTo(models.User, { foreignKey: 'user_id' });
  };
  return Address;
};
