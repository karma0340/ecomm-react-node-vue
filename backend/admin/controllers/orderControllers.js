// admin/controllers/ordersController.js
const db = require('../../models');

exports.listOrders = async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [{ model: db.User, as: 'user' }],
      order: [['createdAt', 'DESC']]
    });
    res.render('orders', {
      layout: 'main',
      title: 'Orders',
      user: req.user,
      orders
    });
  } catch (err) {
    console.error('Error loading orders:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
};
