import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Fuse from 'fuse.js';
import logo from '../assets/images/logo.svg';
import AuthModal from './AuthModal';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PaletteIcon from '@mui/icons-material/Palette';

const THEMES = {
  light: {
    '--app-bg': '#fff',
    '--app-text': '#141414',
    '--nav-bg': '#fff',
    '--nav-border': '#e1e1e1',
    '--primary': '#4955f6',
    '--card-bg': '#fbfbfb',
    '--input-bg': '#f4f6fb',
  },
  dark: {
    '--app-bg': '#121212',
    '--app-text': '#ededed',
    '--nav-bg': '#191a1f',
    '--nav-border': '#353941',
    '--primary': '#7783fa',
    '--card-bg': '#232324',
    '--input-bg': '#191a1f',
  },
  grey: {
    '--app-bg': '#c0c1c6',
    '--app-text': '#242324',
    '--nav-bg': '#ebecec',
    '--nav-border': '#c0c1c6',
    '--primary': '#353941',
    '--card-bg': '#e8e8ea',
    '--input-bg': '#dadbdd',
  }
};

function Header({ user, cartCount, fetchUserAndCart }) {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);

  // Fuzzy search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(['All Categories']);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const searchRef = useRef(null);
  const menuDropdownRef = useRef(null);

  // Wishlist states
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [showWishlistDropdown, setShowWishlistDropdown] = useState(false);
  const wishlistDropdownRef = useRef(null);

  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const vars = THEMES[theme];
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/products?limit=1000')
      .then(res => {
        setAllProducts(res.data.products || []);
        const cats = Array.from(
          new Set(
            (res.data.products || [])
              .map(p => p.category?.name || p.categoryName)
              .filter(Boolean)
          )
        );
        setCategories(['All Categories', ...cats]);
      })
      .catch(err => console.error('Failed to load products for search', err));
  }, []);

  useEffect(() => {
    if (!user) {
      setWishlistProducts([]);
      return;
    }
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/api/wishlist/items', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setWishlistProducts(res.data.products || res.data || []);
      })
      .catch(() => setWishlistProducts([]));
  }, [user]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    let filteredProducts = allProducts;
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filteredProducts = allProducts.filter(
        p =>
          (p.category && p.category.name === selectedCategory) ||
          (p.categoryName === selectedCategory)
      );
    }
    if (val.trim() === '') {
      setSearchResults([]);
      return;
    }
    const fuseLocal = new Fuse(filteredProducts, {
      keys: ['name', 'description'],
      threshold: 0.3,
    });
    const results = fuseLocal.search(val);
    setSearchResults(results.slice(0, 10).map(r => r.item));
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleSelectProduct = (productId) => {
    setSearchTerm('');
    setSearchResults([]);
    navigate(`/product/${productId}`);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchResults([]);
      }
      if (menuDropdownRef.current && !menuDropdownRef.current.contains(event.target)) {
        setShowMainDropdown(false);
      }
      if (wishlistDropdownRef.current && !wishlistDropdownRef.current.contains(event.target)) {
        setShowWishlistDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.info('You have been logged out.');
    if (typeof fetchUserAndCart === 'function') fetchUserAndCart();
    navigate('/');
  };

  const handleRemoveFromWishlist = async (prodId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:3000/api/wishlist/items/${prodId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistProducts(wishlistProducts.filter(p => p.id !== prodId));
      toast.success('Removed from wishlist!');
    } catch (err) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const menuLinks = [
    { to: '/', label: 'Home' },
    { to: '/profile', label: 'Profile' },
    { to: '/cart', label: 'Cart' },
    { to: '/contact', label: 'Contact' },
    { to: '/checkout', label: 'Checkout' },
    { to: '/orders', label: 'Orders' },
    // { to: '/wishlist', label: 'Wishlist' },
    { to: '/address', label: 'Addresses' },
    { to: '/settings', label: 'Settings' }, // Uncomment if you have
    // { to: '/reset-password', label: 'Reset Password' },
    { to: '/forgot-password', label: 'Forgot Password' },
    { to: '/logout', label: 'Logout' }
  ];

  const dropdownAnim = {
    initial: { opacity: 0, scale: 0.98, y: -8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.98, y: -8 },
    transition: { duration: 0.22, type: 'spring' }
  };
  const iconHover = {
    whileHover: { scale: 1.18 },
    transition: { type: "spring", stiffness: 400, damping: 8 }
  };

  function cycleTheme() {
    setTheme(t =>
      t === 'light' ? 'dark' : t === 'dark' ? 'grey' : 'light'
    );
  }

  return (
    <header className="shadow-sm bg-white" style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}>
      <ToastContainer position="top-center" autoClose={2000} />
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          if (typeof fetchUserAndCart === 'function') fetchUserAndCart();
          toast.success('You have logged in successfully!');
        }}
      />
      <motion.div
        className="container-fluid"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.44, type: "spring" }}
      >
        <div className="row py-3 border-bottom" style={{
          background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)'
        }}>
          {/* Logo and Dropdown Menu Button */}
          <div className="col-sm-4 col-lg-2 text-center text-sm-start d-flex gap-3 justify-content-center justify-content-md-start align-items-center" style={{ position: 'relative' }}>
            <div ref={menuDropdownRef} style={{ position: 'relative' }}>
              <motion.button
                {...iconHover}
                className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                type="button"
                aria-label="Open menu"
                onClick={() => setShowMainDropdown(v => !v)}
                style={{ width: 44, height: 44 }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2">
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              </motion.button>
              <AnimatePresence>
                {showMainDropdown && (
                  <motion.ul
                    {...dropdownAnim}
                    className="dropdown-menu show mt-2"
                    style={{
                      display: 'block',
                      position: 'absolute',
                      left: 0,
                      minWidth: 180,
                      zIndex: 2220,
                      background: 'var(--card-bg)',
                      color: 'var(--app-text)'
                    }}
                  >
                    {menuLinks.map(link => (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className="dropdown-item"
                          onClick={() => setShowMainDropdown(false)}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
            {/* Logo */}
            <motion.div
              className="d-flex align-items-center my-3 my-sm-0 ms-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <Link to="/">
                <img
                  src={logo}
                  alt="logo"
                  className="img-fluid"
                  style={{
                    maxHeight: '118px',
                    height: 'auto',
                    width: 'auto',
                    display: 'block',
                    marginTop: '-65px',
                    marginBottom: '-65px',
                    padding: 0
                  }}
                />
              </Link>
            </motion.div>
          </div>

          {/* Search Bar with Fuzzy Search and Category Filter */}
          <div className="col-sm-6 offset-sm-2 offset-md-0 col-lg-4" ref={searchRef} style={{ position: 'relative' }}>
            <motion.div
              className="search-bar row bg-light p-2 rounded-4"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.36, type: 'spring' }}
              style={{ background: 'var(--input-bg)' }}
            >
              <div className="col-md-4 d-none d-md-block">
                <select
                  className="form-select border-0 bg-transparent"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  style={{ color: 'var(--app-text)', background: 'var(--input-bg)' }}
                >
                  {categories.map(cat => (
                    <option key={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="col-11 col-md-7" style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent"
                  placeholder="Search for products"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search products"
                  autoComplete="off"
                  style={{ color: 'var(--app-text)', background: 'var(--input-bg)' }}
                />
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="list-group position-absolute w-100"
                      style={{ zIndex: 1050, maxHeight: '300px', overflowY: 'auto', background: 'var(--card-bg)' }}
                      key="searchResults"
                    >
                      {searchResults.map(product => (
                        <li
                          key={product.id}
                          className="list-group-item list-group-item-action"
                          style={{ cursor: 'pointer', background: 'var(--card-bg)', color: "var(--app-text)" }}
                          onClick={() => handleSelectProduct(product.id)}
                        >
                          {product.name}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
              <div className="col-1 d-flex align-items-center justify-content-end pe-2">
                <svg width="24" height="24" fill="none" stroke="#636363" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </motion.div>
          </div>

          {/* RIGHT BAR (icons and actions only) */}
          <div className="col-lg-6 d-flex align-items-center justify-content-end">
            <ul className="d-flex justify-content-end list-unstyled m-0 align-items-center">
              {/* Account+Logout */}
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}>
                <motion.button
                  {...iconHover}
                  type="button"
                  className="p-2 mx-1 btn btn-link d-flex align-items-center"
                  onClick={handleUserClick}
                  aria-label={user ? "My Account" : "Login"}
                  style={{ color: user ? "var(--primary)" : "#222", paddingRight: user ? 6 : undefined, fontWeight: 500 }}
                >
                  <AccountCircleOutlinedIcon style={{ fontSize: 26, verticalAlign: "middle" }} />
                  {user ? (
                    <span className="ms-1">{user.username || user.name || user.email}</span>
                  ) : (
                    <span className="ms-1">Login</span>
                  )}
                </motion.button>
                {user && (
                  <motion.button
                    {...iconHover}
                    type="button"
                    className="btn btn-link p-0 text-danger d-flex align-items-center"
                    onClick={handleLogout}
                    style={{
                      fontSize: '0.95em',
                      verticalAlign: "middle",
                      fontWeight: 500,
                      whiteSpace: "nowrap"
                    }}
                  >
                    <LogoutIcon fontSize="small" style={{ verticalAlign: "middle" }} />
                    <span className="ms-1">Logout</span>
                  </motion.button>
                )}
              </li>
              {/* Wishlist */}
              <li ref={wishlistDropdownRef} style={{ position: 'relative' }}>
                <motion.button
                  {...iconHover}
                  type="button"
                  className="p-2 mx-1 btn btn-link position-relative"
                  onClick={() => setShowWishlistDropdown(v => !v)}
                  aria-label="Wishlist"
                  style={{ color: "#DC143C" }}
                >
                  <FavoriteBorderOutlinedIcon style={{ fontSize: 24, verticalAlign: "middle" }} />
                  {wishlistProducts.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {wishlistProducts.length}
                    </span>
                  )}
                </motion.button>
                <AnimatePresence>
                  {showWishlistDropdown && (
                    <motion.ul
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="dropdown-menu show p-2"
                      style={{
                        display: 'block',
                        position: 'absolute',
                        right: 0,
                        minWidth: 220,
                        maxHeight: 320,
                        overflowY: 'auto',
                        zIndex: 2000,
                        background: 'var(--card-bg)',
                        color: 'var(--app-text)'
                      }}
                    >
                      {wishlistProducts.length === 0 ? (
                        <li className="dropdown-item text-secondary">No products in wishlist.</li>
                      ) : (
                        wishlistProducts.map(prod => (
                          <li key={prod.id} className="dropdown-item d-flex align-items-center justify-content-between" style={{ cursor: 'pointer' }}>
                            <div
                              onClick={() => {
                                setShowWishlistDropdown(false);
                                navigate(`/product/${prod.id}`);
                              }}
                              style={{ display: 'flex', alignItems: 'center', flex: 1 }}
                            >
                              <img
                                src={prod.imageUrl?.startsWith('http') ? prod.imageUrl : `http://localhost:3000${prod.imageUrl}`}
                                alt={prod.name}
                                style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, marginRight: 10 }}
                              />
                              <span>{prod.name}</span>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger ms-2"
                              title="Remove from wishlist"
                              onClick={(e) => handleRemoveFromWishlist(prod.id, e)}
                            >
                              &times;
                            </button>
                          </li>
                        ))
                      )}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
              {/* Cart */}
              <li>
                <motion.button
                  {...iconHover}
                  type="button"
                  className="p-2 mx-1 btn btn-link position-relative"
                  onClick={() => navigate('/cart')}
                  aria-label="Cart"
                  style={{ color: "#0A7D2F" }}
                >
                  <ShoppingBagOutlinedIcon style={{ fontSize: 25, verticalAlign: "middle" }} />
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </motion.button>
              </li>
              {/* Theme switcher */}
              <li>
                <motion.button
                  {...iconHover}
                  type="button"
                  title={`Switch theme`}
                  className="btn btn-link p-2 m-0"
                  onClick={cycleTheme}
                  style={{
                    color:
                      theme === "dark"
                        ? "#eee"
                        : theme === "grey"
                        ? "#353941"
                        : "#525252",
                    background: "transparent",
                    fontSize: "1.18em"
                  }}
                >
                  {theme === "light" && <Brightness4Icon />}
                  {theme === "dark" && <PaletteIcon />}
                  {theme === "grey" && <Brightness7Icon />}
                </motion.button>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </header>
  );
}

export default Header;
