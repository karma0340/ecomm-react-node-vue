import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ cartItems, fetchUserAndCart, setCartItems }) {
  const [form, setForm] = useState({
    shippingAddress: '',
    paymentMethod: 'cod',
    phone: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [cardProcessing, setCardProcessing] = useState(false);

  // OTP & Step state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false); // (for card, triggers payment)

  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // Animation variant
  const fadeUp = {
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 28 }
  };

  // Order items
  const items = cartItems.map((item) => ({
    productId: item.product?.id || item.productId || item.id,
    quantity: item.quantity || 1,
  }));
  const totalAmount = cartItems.reduce(
    (sum, item) =>
      sum + ((item.product?.price || item.price || 0) * (item.quantity || 1)),
    0
  );

  // Stripe: get client secret on card select & cart change
  useEffect(() => {
    const getClientSecret = async () => {
      if (form.paymentMethod === 'card' && cartItems.length > 0) {
        const amountInPaise = Math.round(totalAmount * 100);
        try {
          const res = await axios.post(
            'http://localhost:3000/api/payment/create-payment-intent',
            { amount: amountInPaise }
          );
          setClientSecret(res.data.clientSecret);
        } catch (err) {
          setOrderError('Failed to initiate card payment.');
          setClientSecret('');
        }
      } else {
        setClientSecret('');
      }
    };
    getClientSecret();
    // eslint-disable-next-line
  }, [form.paymentMethod, cartItems]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Step 1 for both: always send OTP, open dialog
  const handleOrder = async (e) => {
    e.preventDefault();
    setOrderError('');
    setOrderSuccess('');
    setOtpError('');
    setOtpVerified(false);
    setOtpSending(true);
    try {
      await axios.post('http://localhost:3000/api/orders/send-otp', {
        email: form.email
      });
      setOtpDialogOpen(true);
    } catch (err) {
      setOrderError(
        err.response?.data?.error ||
        'Failed to send OTP. Please check your email address and try again.'
      );
    }
    setOtpSending(false);
  };

  // Step 2: OTP Dialog submit. For COD = verify+place. For card = verify only.
  const handleOtpDialog = async () => {
    setOtpError('');
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      if (form.paymentMethod === 'cod') {
        // VERIFY OTP AND PLACE ORDER (COD)
        await axios.post(
          'http://localhost:3000/api/orders/verify-otp-and-place',
          {
            email: form.email,
            otp: otpValue,
            orderData: {
              ...form,
              items,
              status: 'pending',
              paymentMethod: 'cod'
            }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await axios.delete('http://localhost:3000/api/cart/items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (typeof fetchUserAndCart === 'function') await fetchUserAndCart();
        setCartItems([]);
        setOrderSuccess('✅ Order placed successfully!');
        setOtpDialogOpen(false);
        setTimeout(() => navigate('/thank-you'), 1500);
      }
      else if (form.paymentMethod === 'card') {
        // VERIFY ONLY! Do not place order yet.
        await axios.post(
          'http://localhost:3000/api/orders/verify-otp',
          { email: form.email, otp: otpValue }
        );
        setOtpVerified(true); // useEffect below will process payment/order
        setOtpDialogOpen(false);
      }
    } catch (err) {
      setOtpError(err?.response?.data?.error || 'Incorrect or expired OTP');
    }
    setLoading(false);
  };

  // Step 3: On card, if OTP verified, process Stripe payment and order
  useEffect(() => {
    const cardPayAndOrder = async () => {
      if (!otpVerified || form.paymentMethod !== 'card') return;
      setOrderError('');
      setLoading(true);
      setCardProcessing(true);
      const token = localStorage.getItem('token');
      try {
        // 1. Stripe payment
        if (!stripe || !elements || !clientSecret) throw new Error('Stripe not ready');
        const cardElement = elements.getElement(CardElement);
        const { paymentIntent, error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: form.email,
                email: form.email,
                phone: form.phone,
              },
            },
          }
        );
        if (error) throw new Error(error.message || 'Card payment failed');
        if (paymentIntent.status !== 'succeeded')
          throw new Error('Payment was not successful. Please try again.');

        // 2. Actually place order now (with all details)
        await axios.post(
          'http://localhost:3000/api/orders',
          {
            ...form,
            items,
            paymentIntentId: paymentIntent.id,
            status: 'paid',
            paymentMethod: 'card'
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await axios.delete('http://localhost:3000/api/cart/items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (typeof fetchUserAndCart === 'function') await fetchUserAndCart();
        setCartItems([]);
        setOrderSuccess('🎉 Payment successful! Order placed.');
        setTimeout(() => navigate('/thank-you'), 1800);
      } catch (err) {
        setOrderError(err?.response?.data?.error || err?.message || 'Order failed');
      }
      setLoading(false);
      setCardProcessing(false);
      setOtpVerified(false);
    };
    cardPayAndOrder();
    // eslint-disable-next-line
  }, [otpVerified]);

  const handleCloseOtpDialog = () => {
    setOtpDialogOpen(false);
    setOtpValue('');
    setOtpError('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.98 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <Box maxWidth="600px" mx="auto" mt={5}>
        <Paper elevation={5} sx={{
          p: 4, borderRadius: 4,
          boxShadow: "0 16px 32px #1976d211"
        }}>
          <motion.div {...fadeUp}>
            <Typography variant="h5" mb={2} style={{ fontWeight: 700, color: "#273677" }}>
              <span role="img" aria-label="checkout">🧾</span> Checkout
            </Typography>
          </motion.div>
          <motion.form {...fadeUp} onSubmit={handleOrder}>
            <TextField
              label="Shipping Address"
              name="shippingAddress"
              value={form.shippingAddress}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              type="email"
              variant="outlined"
            />
            <TextField
              label="Payment Method"
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              select
              SelectProps={{ native: true }}
              variant="outlined"
            >
              <option value="cod">Cash on Delivery (with Email OTP)</option>
              <option value="card">Card (Stripe)</option>
            </TextField>
            <AnimatePresence>
              {form.paymentMethod === 'card' && (
                <motion.div {...fadeUp} key="cardbox">
                  <Box mt={2} mb={2}>
                    <Typography variant="subtitle2" mb={1} fontWeight={600} color="primary">
                      Card Details
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, background: "#f7f9fc" }}>
                      <CardElement options={{ hidePostalCode: true }} />
                    </Paper>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
            <Divider sx={{ my: 3 }} />
            <motion.div {...fadeUp}>
              <Typography variant="subtitle1" mb={1} fontWeight="bold" color="primary">
                Order Summary
              </Typography>
              {cartItems.map((item, i) => (
                <motion.div
                  className="order-product-row"
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#f5f8fa", marginBottom: 8, padding: "7px 13px", borderRadius: 8
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#223" }}>
                    {item.product?.name || item.name}
                  </span>
                  <span style={{ color: "#374", fontWeight: 600 }}>×{item.quantity || 1}</span>
                </motion.div>
              ))}
              <Typography mt={2} fontWeight="bold" variant="h6" sx={{ color: "#226", letterSpacing: ".02em" }}>
                Total:&nbsp;
                <span style={{
                  color: "#21b67a",
                  fontWeight: 800,
                  background: "linear-gradient(90deg,#d0ffe0 20%,#e0ffe5 69%)",
                  borderRadius: "9px",
                  padding: "4px 12px 4px 13px",
                  fontSize: "1.15em"
                }}>
                  ₹{totalAmount}
                </span>
              </Typography>
            </motion.div>
            <AnimatePresence>
              {orderError && (
                <motion.div
                  key="orderErr"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.18 }}
                >
                  <Alert severity="error" sx={{ mt: 3 }}>
                    {orderError}
                  </Alert>
                </motion.div>
              )}
              {orderSuccess && (
                <motion.div
                  key="orderSuc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.18 }}
                >
                  <Alert severity="success" sx={{ mt: 3 }}>
                    {orderSuccess}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
            <Box mt={3}>
              <motion.div whileHover={{ scale: 1.025 }} whileTap={{ scale: 0.965 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  disabled={
                    loading ||
                    otpSending ||
                    (form.paymentMethod === 'card' && cardProcessing)
                  }
                  fullWidth
                  size="large"
                  sx={{
                    boxShadow: "0 8px 32px #31eea512",
                    letterSpacing: ".03em",
                    fontWeight: 700,
                  }}
                >
                  {(loading || otpSending || (form.paymentMethod === 'card' && cardProcessing))
                    ? (<CircularProgress size={24} />)
                    : 'Place Order & Get OTP'}
                </Button>
              </motion.div>
            </Box>
          </motion.form>
        </Paper>
      </Box>
      {/* OTP Dialog for both methods */}
      <Dialog open={otpDialogOpen} onClose={handleCloseOtpDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Enter OTP sent to your email</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            We have sent a one-time password to <b>{form.email}</b>.<br />
            Please enter it below to confirm your order.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="OTP"
            margin="dense"
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value)}
            inputProps={{ maxLength: 6 }}
            variant="outlined"
          />
          {otpError && <Alert severity="error" sx={{ mt: 1 }}>{otpError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOtpDialog} disabled={loading}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleOtpDialog}
            disabled={loading || otpValue.length !== 6}
          >
            {loading ? <CircularProgress size={22} /> : 'Confirm OTP'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

function Checkout({ fetchUserAndCart }) {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:3000/api/cart/items', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setCartItems([]);
      }
    };
    fetchCart();
  }, []);

  return (
    <AnimatePresence>
      {(!cartItems || cartItems.length === 0) ? (
        <motion.div
          key="emptyCart"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.44, type: "spring" }}
        >
          <Box mt={8} textAlign="center">
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
              Your cart is empty.
            </Typography>
            <motion.div whileHover={{ scale: 1.09 }}>
              <Button
                variant="contained"
                size="large"
                color="primary"
                sx={{ mt: 3, fontWeight: 600 }}
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      ) : (
        <Elements stripe={stripePromise}>
          <CheckoutForm
            cartItems={cartItems}
            fetchUserAndCart={fetchUserAndCart}
            setCartItems={setCartItems}
          />
        </Elements>
      )}
    </AnimatePresence>
  );
}

export default Checkout;
