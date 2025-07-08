import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// MUI components
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Button,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add, Remove, Delete, ShoppingCart, Home } from '@mui/icons-material';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch cart items from backend
  const fetchCart = () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      setCartItems([]);
      setLoading(false);
      setError('You must be logged in to view your cart.');
      return;
    }
    axios
      .get('http://localhost:3000/api/cart/items', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setCartItems(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        setCartItems([]);
        setLoading(false);
        setError('Failed to load cart. Please try again.');
      });
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, []);

  // Remove item from cart
  const handleRemove = (cartItemId) => {
    if (!window.confirm('Remove this item from your cart?')) return;
    const token = localStorage.getItem('token');
    axios
      .delete(`http://localhost:3000/api/cart/items/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setCartItems(cartItems.filter(item => item.id !== cartItemId));
      })
      .catch(() => setError('Failed to remove item. Please try again.'));
  };

  // Update item quantity
  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem('token');
    axios
      .put(
        `http://localhost:3000/api/cart/items/${cartItemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(res => {
        setCartItems(cartItems.map(item =>
          item.id === cartItemId ? { ...item, quantity: res.data.quantity } : item
        ));
      })
      .catch(() => setError('Failed to update quantity. Please try again.'));
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    const token = localStorage.getItem('token');
    axios
      .delete('http://localhost:3000/api/cart/items', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => setCartItems([]))
      .catch(() => setError('Failed to clear cart. Please try again.'));
  };

  // Calculate total cart value
  const total = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * (item.quantity || 1);
  }, 0);

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box mt={4}>
      <Alert severity="error">{error}</Alert>
    </Box>
  );

  if (!cartItems.length)
    return (
      <Box mt={8} textAlign="center">
        <ShoppingCart sx={{ fontSize: 60, color: "grey.400" }} />
        <Typography variant="h5" mt={2} mb={2}>Your cart is empty.</Typography>
        <Button
          variant="contained"
          startIcon={<Home />}
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </Box>
    );

  return (
    <Box maxWidth="900px" mx="auto" mt={5} px={2}>
      <Typography variant="h4" mb={3} fontWeight={600} display="flex" alignItems="center" gap={1}>
        <ShoppingCart color="primary" /> Your Cart
      </Typography>
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Subtotal</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cartItems.map(item => {
                const product = item.product || {};
                const name = product.name || item.name || 'Product';
                const price = product.price || item.price || 0;
                const quantity = item.quantity || 1;
                const image = product.imageUrl || 'https://via.placeholder.com/80x80?text=No+Image';
                return (
                  <TableRow key={item.id || item.productId}>
                    <TableCell>
                      <Avatar
                        variant="rounded"
                        src={image}
                        alt={name}
                        sx={{ width: 64, height: 64, bgcolor: "grey.100" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{name}</Typography>
                      {product.description && (
                        <Typography variant="body2" color="text.secondary">
                          {product.description.slice(0, 60)}...
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, quantity - 1)}
                          disabled={quantity <= 1}
                          color="primary"
                        >
                          <Remove />
                        </IconButton>
                        <Typography>{quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleQuantityChange(item.id, quantity + 1)}
                          color="primary"
                        >
                          <Add />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell>₹{price}</TableCell>
                    <TableCell>₹{price * quantity}</TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => handleRemove(item.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Button variant="outlined" color="error" onClick={handleClearCart}>
            Clear Cart
          </Button>
          <Typography variant="h6" fontWeight={600}>
            Total: ₹{total}
          </Typography>
        </Box>
      </Paper>

      {/* Proceed to Checkout Button */}
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => navigate('/checkout')}
        >
          Proceed to Checkout
        </Button>
      </Box>
    </Box>
  );
}

export default Cart;
