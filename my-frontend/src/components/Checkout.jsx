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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Only call loadStripe ONCE at the module level
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ cartItems, fetchUserAndCart, setCartItems }) {
  const [form, setForm] = useState({
    shippingAddress: '',
    paymentMethod: 'cod',
    phoneNumber: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [cardProcessing, setCardProcessing] = useState(false);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // Fetch PaymentIntent client secret if paymentMethod is 'card'
  useEffect(() => {
    const getClientSecret = async () => {
      if (form.paymentMethod === 'card' && cartItems.length > 0) {
        const total = cartItems.reduce(
          (sum, item) =>
            sum + ((item.product?.price || item.price || 0) * (item.quantity || 1)),
          0
        );
        const amountInPaise = Math.round(total * 100); // Stripe expects paise for INR
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

  const handleOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOrderError('');
    setOrderSuccess('');
    const token = localStorage.getItem('token');
    const items = cartItems.map((item) => ({
      productId: item.product?.id || item.productId || item.id,
      quantity: item.quantity || 1,
    }));

    // Card payment flow
    if (form.paymentMethod === 'card') {
      if (!stripe || !elements) {
        setOrderError('Stripe is not loaded.');
        setLoading(false);
        return;
      }
      if (!clientSecret) {
        setOrderError('Failed to initiate card payment.');
        setLoading(false);
        return;
      }
      setCardProcessing(true);
      try {
        // Confirm card payment
        const cardElement = elements.getElement(CardElement);
        const { paymentIntent, error } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: form.email,
                email: form.email,
                phone: form.phoneNumber,
              },
            },
          }
        );
        if (error) {
          setOrderError(error.message || 'Card payment failed');
          setCardProcessing(false);
          setLoading(false);
          return;
        }
        if (paymentIntent.status === 'succeeded') {
          // Create order in backend
          await axios.post(
            'http://localhost:3000/api/orders',
            {
              ...form,
              items,
              paymentIntentId: paymentIntent.id,
              paymentStatus: 'paid',
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          await axios.delete('http://localhost:3000/api/cart/items', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (typeof fetchUserAndCart === 'function') {
            await fetchUserAndCart();
          }
          setCartItems([]);
          setOrderSuccess('Payment successful! Order placed.');
          setTimeout(() => navigate('/thank-you'), 2000);
        } else {
          setOrderError('Payment was not successful. Please try again.');
        }
      } catch (err) {
        setOrderError(err.response?.data?.error || 'Order failed');
      }
      setCardProcessing(false);
      setLoading(false);
      return;
    }

    // Cash on Delivery flow
    try {
      await axios.post(
        'http://localhost:3000/api/orders',
        {
          ...form,
          items,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await axios.delete('http://localhost:3000/api/cart/items', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (typeof fetchUserAndCart === 'function') {
        await fetchUserAndCart();
      }
      setCartItems([]);
      setOrderSuccess('Order placed successfully!');
      setTimeout(() => navigate('/thank-you'), 2000);
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Order failed');
    }
    setLoading(false);
  };

  return (
    <Box maxWidth="600px" mx="auto" mt={5}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>
          Checkout
        </Typography>
        <form onSubmit={handleOrder}>
          <TextField
            label="Shipping Address"
            name="shippingAddress"
            value={form.shippingAddress}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
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
          >
            <option value="cod">Cash on Delivery</option>
            <option value="card">Card (Stripe)</option>
          </TextField>
          {form.paymentMethod === 'card' && (
            <Box mt={2} mb={2}>
              <Typography variant="subtitle2" mb={1}>
                Card Details
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <CardElement options={{ hidePostalCode: true }} />
              </Paper>
            </Box>
          )}
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              Order Summary
            </Typography>
            {cartItems.map((item) => (
              <Box key={item.id} display="flex" justifyContent="space-between">
                <span>{item.product?.name || item.name}</span>
                <span>x{item.quantity || 1}</span>
              </Box>
            ))}
            <Typography mt={1} fontWeight="bold">
              Total: ₹
              {cartItems.reduce(
                (sum, item) =>
                  sum + ((item.product?.price || item.price || 0) * (item.quantity || 1)),
                0
              )}
            </Typography>
          </Box>
          {orderError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {orderError}
            </Alert>
          )}
          {orderSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {orderSuccess}
            </Alert>
          )}
          <Box mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="success"
              disabled={loading || (form.paymentMethod === 'card' && cardProcessing)}
              fullWidth
            >
              {loading || (form.paymentMethod === 'card' && cardProcessing) ? (
                <CircularProgress size={24} />
              ) : form.paymentMethod === 'card' ? (
                'Pay & Place Order'
              ) : (
                'Place Order'
              )}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

function Checkout({ fetchUserAndCart }) {
  const [cartItems, setCartItems] = useState([]);

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

  if (!cartItems.length)
    return (
      <Box mt={8} textAlign="center">
        <Typography variant="h5">Your cart is empty.</Typography>
        <Button variant="contained" onClick={() => (window.location = '/')}>
          Continue Shopping
        </Button>
      </Box>
    );

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        cartItems={cartItems}
        fetchUserAndCart={fetchUserAndCart}
        setCartItems={setCartItems}
      />
    </Elements>
  );
}

export default Checkout;
