const orderService = require('../services/orderService');
const db = require('../models');
const nodemailer = require('nodemailer');

// In-memory store for OTPs
const otps = {}; // { userEmail: { otp: '123456', expires: Date } }

// 🔥 Create the mail transporter ONCE using .env variables:
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ==========================
// 1. Send OTP to email
// ==========================
exports.sendOrderOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 min expiry
    otps[email] = { otp, expires };

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Order OTP Verification',
      text: `Your OTP for order verification is: ${otp}`,
    });

    res.json({ message: 'OTP sent to email!' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to send OTP.' });
  }
};

// ==========================
// 2. Verify OTP ONLY (card flow) - does NOT place order
// ==========================
exports.verifyOtpOnly = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: 'Email and OTP are required' });
    const record = otps[email];
    if (!record || Date.now() > record.expires)
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    if (otp !== record.otp)
      return res.status(400).json({ error: 'Incorrect OTP' });
    delete otps[email];
    res.json({ message: 'OTP verified!' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'OTP verification failed.' });
  }
};

// Helper for building HTML table of ordered products
function buildOrderItemsHtml(order) {
  if (!order.items || order.items.length === 0) return '<tr><td>No items.</td></tr>';
  return order.items.map(item =>
    `<tr style="border-bottom:1px solid #eee;">
      <td style="padding:7px 5px;">
        <img src="${item.productImage || ''}" width="54" alt="${item.productName || 'Product'}" style="border-radius:8px;border:1px solid #ddd;">
      </td>
      <td style="padding:7px 14px;">
        <span style="font-weight:600;">${item.productName}</span><br>
        <span style="font-size:14px;color:#666;">Qty: ${item.quantity}</span>
      </td>
      <td style="padding:7px 4px;text-align:right;">₹${item.price}</td>
    </tr>`
  ).join('\n');
}

function buildOrderConfirmationHtml(order) {
  return `
  <div style="font-family:sans-serif;max-width:520px;margin:0 auto;border:1px solid #ececec;border-radius:11px;box-shadow:0 2px 18px #0001;padding:32px;background:#f8fafb;">
    <h2 style="color:#1976d2;">Thank you for your order!</h2>
    <p style="margin-bottom:13px;">
      Order <span style="font-weight:700;">#${order.id}</span> placed on <b>${new Date(order.createdAt).toLocaleDateString()}</b>.
      <br>We'll notify you when your order is shipped.
    </p>

    <table style="width:100%;border-collapse:collapse;background:white;border-radius:9px 9px 0 0;overflow:hidden;">
      ${buildOrderItemsHtml(order)}
      <tr>
        <td colspan="2" style="text-align:right;font-weight:700;padding-top:21px;">Order total:</td>
        <td style="text-align:right;font-weight:700;padding-top:21px;">₹${order.total}</td>
      </tr>
    </table>
    <div style="padding:11px 0 0 0;">
      <b>Shipping address:</b><br>
      ${order.shippingAddress || ''}
    </div>
    <div style="margin:5px 0 16px 0;">
      <b>Payment method:</b> ${order.paymentMethod || ''}
    </div>
    <a href="https://your-store.com/orders"
      style="margin:18px 0 0 0; display:inline-block; background:#21b67a; color:white; padding:13px 26px; border-radius:6px; text-decoration:none; font-size:16px; font-weight:600;">View your order</a>
    <hr style="margin:28px 0 14px 0;">
    <div style="font-size:14px;color:#888;">
      Have questions? Contact us at <a href="mailto:support@your-store.com">support@your-store.com</a>.<br>
      Thank you for shopping with <b>Your Shop</b>!
    </div>
  </div>
  `;
}

// ==========================
// 3. Verify OTP and Place Order (COD flow)
// ==========================
exports.verifyOtpAndPlaceOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, otp, orderData } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: 'Email and OTP are required' });

    const record = otps[email];
    // Validate OTP
    if (!record || Date.now() > record.expires)
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    if (otp !== record.otp)
      return res.status(400).json({ error: 'Incorrect OTP' });
    delete otps[email];

    // Place the order
    const order = await orderService.createOrder(userId, orderData);

    await db.Activity.create({
      userId: userId,
      action: `Placed order #${order.id} (OTP verified)`,
    });

    // --- Send order confirmation HTML email ---
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: order.email,
        subject: `Order Confirmation - Order #${order.id}`,
        html: buildOrderConfirmationHtml(order)
      });
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError);
    }

    res.status(201).json({ message: 'Order placed successfully!', orderId: order.id });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Order placement failed.' });
  }
};

// ==========================
// 4. Place order (used for card/Stripe after OTP + payment)
// ==========================
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const order = await orderService.createOrder(userId, req.body);

    await db.Activity.create({
      userId: userId,
      action: `Placed order #${order.id}`,
    });

    // --- Send order confirmation HTML email ---
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: order.email,
        subject: `Order Confirmation - Order #${order.id}`,
        html: buildOrderConfirmationHtml(order)
      });
    } catch (emailError) {
      console.error('Order confirmation email failed:', emailError);
    }

    res.status(201).json({ message: 'Order placed successfully!', orderId: order.id });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Order placement failed.' });
  }
};

// [Optional: admin/non-OTP direct order]
