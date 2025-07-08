module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    userId: DataTypes.INTEGER,
    title: DataTypes.STRING,
    message: DataTypes.STRING,
    // Add more fields as needed
  });
  return Notification;
};
