const { Order, OrderItem, Product } = require('../models');

exports.createOrder = async (userId, orderData) => {
  const {
    shippingAddress,
    paymentMethod,
    phone,
    email,
    items,
    paymentIntentId,
    paymentStatus  // comes from frontend as 'pending' or 'paid'
  } = orderData;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('No items to order.');
  }

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

  // 👇 Ensure only allowed status values are ever used:
  // - For COD/unpaid, use 'pending'
  // - For paid (Stripe/card), use 'paid'
  // - Use whatever comes from frontend ONLY IF it's a valid value (not 'cod')!

  let finalStatus;
  if (
    paymentStatus &&
    [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'paid'
    ].includes(paymentStatus)
  ) {
    finalStatus = paymentStatus;
  } else if (paymentMethod === 'card') {
    finalStatus = 'paid';
  } else {
    finalStatus = 'pending';
  }

  // Create order and order items in a transaction
  const order = await Order.create(
    {
      userId,
      total,
      status: finalStatus,         // ✅ Always valid
      shippingAddress,
      paymentMethod,                // 'cod', 'card', etc
      phone,
      email,
      paymentIntentId: paymentIntentId || null,
      items: orderItems
    },
    { include: [{ model: OrderItem, as: 'items' }] }
  );

  return order;
};
