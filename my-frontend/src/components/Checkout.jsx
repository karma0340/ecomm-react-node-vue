import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, TextField, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function Checkout({ fetchUserAndCart }) {
  const [cartItems, setCartItems] = useState([]);
  const [form, setForm] = useState({
    shippingAddress: '',
    paymentMethod: 'cod',
    phoneNumber: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:3000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCartItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setCartItems([]);
      }
    };
    fetchCart();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOrder = async e => {
    e.preventDefault();
    setLoading(true);
    setOrderError('');
    setOrderSuccess('');
    const token = localStorage.getItem('token');
    try {
      const items = cartItems.map(item => ({
        productId: item.product?.id || item.productId || item.id,
        quantity: item.quantity || 1
      }));
      await axios.post('http://localhost:3000/api/orders', {
        ...form,
        items
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear the cart in backend and wait for it to finish
      await axios.delete('http://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Optional: Wait a short moment to ensure backend updates (helps with slow APIs)
      await new Promise(res => setTimeout(res, 200));

      // Now fetch the updated cart count for the header
      if (typeof fetchUserAndCart === 'function') {
        await fetchUserAndCart();
      }

      // Clear local cart state
      setCartItems([]);
      setOrderSuccess('Order placed successfully!');

      setTimeout(() => navigate('/thank-you'), 2000);
    } catch (err) {
      setOrderError(err.response?.data?.error || 'Order failed');
    }
    setLoading(false);
  };

  if (!cartItems.length) return (
    <Box mt={8} textAlign="center">
      <Typography variant="h5">Your cart is empty.</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Continue Shopping</Button>
    </Box>
  );

  return (
    <Box maxWidth="600px" mx="auto" mt={5}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" mb={2}>Checkout</Typography>
        <form onSubmit={handleOrder}>
          <TextField
            label="Shipping Address"
            name="shippingAddress"
            value={form.shippingAddress}
            onChange={handleChange}
            fullWidth required margin="normal"
          />
          <TextField
            label="Phone Number"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            fullWidth required margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth required margin="normal" type="email"
          />
          <TextField
            label="Payment Method"
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            fullWidth required margin="normal"
            select SelectProps={{ native: true }}
          >
            <option value="cod">Cash on Delivery</option>
            <option value="card" disabled>Card (Coming Soon)</option>
          </TextField>
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight="bold">Order Summary</Typography>
            {cartItems.map(item => (
              <Box key={item.id} display="flex" justifyContent="space-between">
                <span>{item.product?.name || item.name}</span>
                <span>x{item.quantity || 1}</span>
              </Box>
            ))}
            <Typography mt={1} fontWeight="bold">
              Total: ₹{cartItems.reduce((sum, item) => (sum + ((item.product?.price || item.price || 0) * (item.quantity || 1))), 0)}
            </Typography>
          </Box>
          {orderError && <Alert severity="error" sx={{ mt: 2 }}>{orderError}</Alert>}
          {orderSuccess && <Alert severity="success" sx={{ mt: 2 }}>{orderSuccess}</Alert>}
          <Box mt={2}>
            <Button type="submit" variant="contained" color="success" disabled={loading} fullWidth>
              {loading ? <CircularProgress size={24} /> : 'Place Order'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}

export default Checkout;
