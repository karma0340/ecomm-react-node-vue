const orderService = require('../services/orderService');

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await orderService.createOrder(userId, req.body);
    res.status(201).json({ message: 'Order placed successfully!', orderId: order.id });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Order placement failed.' });
  }
};
