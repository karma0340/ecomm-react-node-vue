const orderService = require('../services/orderService');
const db = require('../models');

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await orderService.createOrder(userId, req.body);

    // Log the activity: Placed order
    await db.Activity.create({
      userId: userId,
      action: `Placed order #${order.id}`
    });

    res.status(201).json({ message: 'Order placed successfully!', orderId: order.id });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Order placement failed.' });
  }
};
