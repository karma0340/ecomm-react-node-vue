const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authJwt'); // JWT middleware

// 1. Send OTP to email before placing order (any user, no auth needed)
router.post('/send-otp', orderController.sendOrderOtp);

// 2. Verify OTP ONLY -- for card/Stripe flow (no auth, no order placement)
router.post('/verify-otp', orderController.verifyOtpOnly);

// 3. Verify OTP and place the order (COD flow, user must be logged in)
router.post('/verify-otp-and-place', authenticate, orderController.verifyOtpAndPlaceOrder);

// 4. Place the order (for Stripe after OTP+paid, user must be logged in)
router.post('/', authenticate, orderController.placeOrder);

// If you have other admin/instant order variants, you can add them below.

module.exports = router;
