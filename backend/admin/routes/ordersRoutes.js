const express = require('express');
const router = express.Router();
const db = require('../../models');
const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');

// GET /orders - Orders management page with data
router.get('/', authJwt, isAdmin, async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [{ model: db.User, as: 'user' }],
      order: [['createdAt', 'DESC']]
    });
    // Convert Sequelize instances to plain objects for Handlebars
    const plainOrders = orders.map(order => order.get({ plain: true }));

    res.render('orders', {
      layout: 'main',
      title: 'Orders Management',
      user: req.user,
      orders: plainOrders
    });
  } catch (err) {
    console.error('Error loading orders:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

// Optionally: Delete order (for your delete button)
router.post('/:id/delete', authJwt, isAdmin, async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Not Found',
        user: req.user
      });
    }
    await order.destroy();
    res.redirect('/orders');
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
});

module.exports = router;
