const { Order, OrderItem, Product } = require('../models');

exports.createOrder = async (userId, orderData) => {
  const { shippingAddress, paymentMethod, phoneNumber, email, items } = orderData;
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('No items to order.');
  }

  // Calculate total and prepare order items
  let total = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findByPk(item.productId);
    if (!product) throw new Error('Product not found.');
    const price = product.price;
    total += price * item.quantity;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price,
      productName: product.name,
      productImage: product.imageUrl || ''
    });
  }

  // Create order and order items in a transaction
  const order = await Order.create(
    {
      userId,
      total,
      status: 'pending',
      shippingAddress,
      paymentMethod,
      phoneNumber,
      email,
      items: orderItems
    },
    { include: [{ model: OrderItem, as: 'items' }] }
  );

  return order;
};
