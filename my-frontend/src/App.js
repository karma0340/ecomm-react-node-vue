// App.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom'; // BrowserRouter should be in index.js
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Category from './components/Category';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  // Fetch user and cart info
  const fetchUserAndCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setCartCount(0);
      return;
    }
    try {
      // Fetch user info
      const userRes = await axios.get('http://localhost:3000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);

      // Fetch cart info
      const cartRes = await axios.get('http://localhost:3000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // If cart is an array of items, use its length; otherwise, fallback to 0
      setCartCount(Array.isArray(cartRes.data) ? cartRes.data.length : 0);
    } catch (err) {
      console.error('Error fetching user or cart:', err);
      setUser(null);
      setCartCount(0);
      localStorage.removeItem('token');
    }
  }, []);

  // Fetch user and cart info on mount
  useEffect(() => {
    fetchUserAndCart();
  }, [fetchUserAndCart]);

  return (
    <>
      <Header
        user={user}
        cartCount={cartCount}
        fetchUserAndCart={fetchUserAndCart}
      />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <Category />
              <ProductList
                user={user}
                onCartUpdate={fetchUserAndCart}
              />
            </>
          }
        />
        <Route
          path="/cart"
          element={
            <Cart
              user={user}
              cartCount={cartCount}
              fetchUserAndCart={fetchUserAndCart}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <Checkout
              user={user}
              cartCount={cartCount}
              fetchUserAndCart={fetchUserAndCart}
            />
          }
        />
        {/* Add more routes here as needed */}
      </Routes>
    </>
  );
}

export default App;
