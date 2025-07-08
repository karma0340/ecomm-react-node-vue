const paymentService = require('../services/paymentService');

exports.createPaymentIntent = async (req, res) => {
  try {
    let { amount, currency } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    currency = currency || 'inr';

    // Stripe expects amount in the smallest currency unit (paise for INR)
    amount = parseInt(amount, 10);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // If your frontend sends rupees, convert to paise:
    // amount = amount * 100;

    const paymentIntent = await paymentService.createStripePaymentIntent(amount, currency);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe PaymentIntent error:', err);
    res.status(500).json({ error: 'Stripe payment intent creation failed' });
  }
};
