import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Fuse from 'fuse.js';
import logo from '../assets/images/logo.svg';
import AuthModal from './AuthModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Header({ user, cartCount, fetchUserAndCart }) {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMainDropdown, setShowMainDropdown] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Fetch products for search
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

  // Fetch wishlist products when user changes
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

  // Handle search input
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

  // Handle category change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSearchResults([]);
    setSearchTerm('');
  };

  // Navigate to product page on selection
  const handleSelectProduct = (productId) => {
    setSearchTerm('');
    setSearchResults([]);
    navigate(`/product/${productId}`);
  };

  // Close search results and dropdowns when clicking outside
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
      navigate('/account');
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

  // Remove item from wishlist
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

  // Menu links
  const menuLinks = [
    { to: '/', label: 'Home' },
    { to: '/cart', label: 'Cart' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header>
      <ToastContainer position="top-center" autoClose={2000} />
      {/* Auth Modal */}
      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => {
          if (typeof fetchUserAndCart === 'function') fetchUserAndCart();
          toast.success('You have logged in successfully!');
        }}
      />
      <div className="container-fluid">
        <div className="row py-3 border-bottom">

          {/* Logo and Dropdown Menu Button */}
          <div className="col-sm-4 col-lg-2 text-center text-sm-start d-flex gap-3 justify-content-center justify-content-md-start align-items-center" style={{ position: 'relative' }}>
            {/* Menu Dropdown Button */}
            <div ref={menuDropdownRef} style={{ position: 'relative' }}>
              <button
                className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                type="button"
                aria-label="Open menu"
                onClick={() => setShowMainDropdown(v => !v)}
                style={{ width: 44, height: 44 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <use xlinkHref="#menu"></use>
                </svg>
              </button>
              {showMainDropdown && (
                <ul className="dropdown-menu show mt-2"
                  style={{
                    display: 'block',
                    position: 'absolute',
                    left: 0,
                    minWidth: 180,
                    zIndex: 2000
                  }}>
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
                </ul>
              )}
            </div>
            {/* Logo */}
            <div className="d-flex align-items-center my-3 my-sm-0 ms-2">
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
            </div>
          </div>

          {/* Search Bar with Fuzzy Search and Category Filter */}
          <div className="col-sm-6 offset-sm-2 offset-md-0 col-lg-4" ref={searchRef} style={{ position: 'relative' }}>
            <div className="search-bar row bg-light p-2 rounded-4">
              <div className="col-md-4 d-none d-md-block">
                <select
                  className="form-select border-0 bg-transparent"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
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
                  placeholder="Search for more than 20,000 products"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search products"
                  autoComplete="off"
                />
                {searchResults.length > 0 && (
                  <ul className="list-group position-absolute w-100" style={{ zIndex: 1050, maxHeight: '300px', overflowY: 'auto' }}>
                    {searchResults.map(product => (
                      <li
                        key={product.id}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelectProduct(product.id)}
                      >
                        {product.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="col-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M21.71 20.29L18 16.61A9 9 0 1 0 16.61 18l3.68 3.68a1 1 0 0 0 1.42 0a1 1 0 0 0 0-1.39ZM11 18a7 7 0 1 1 7-7a7 7 0 0 1-7 7Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Navbar Links */}
          <div className="col-lg-4">
            <ul className="navbar-nav list-unstyled d-flex flex-row gap-3 gap-lg-5 justify-content-center flex-wrap align-items-center mb-0 fw-bold text-uppercase text-dark">
              <li className="nav-item dropdown" style={{ position: 'relative' }}>
                <button
                  className="nav-link dropdown-toggle pe-3 btn btn-link"
                  type="button"
                  id="pages"
                  aria-expanded={showDropdown}
                  style={{ textDecoration: 'none' }}
                  onClick={() => setShowDropdown(v => !v)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                >
                  Pages
                </button>
                {showDropdown && (
                  <ul
                    className="dropdown-menu border-0 p-3 rounded-0 shadow show"
                    aria-labelledby="pages"
                    style={{
                      display: 'block',
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      zIndex: 2000,
                    }}
                  >
                    <li><Link to="/about" className="dropdown-item">About Us</Link></li>
                    <li><Link to="/cart" className="dropdown-item">Cart</Link></li>
                    <li><Link to="/checkout" className="dropdown-item">Checkout</Link></li>
                    <li><Link to="/contact" className="dropdown-item">Contact</Link></li>
                  </ul>
                )}
              </li>
            </ul>
          </div>

          {/* User/Wishlist/Cart Icons */}
          <div className="col-sm-8 col-lg-2 d-flex gap-5 align-items-center justify-content-center justify-content-sm-end">
            <ul className="d-flex justify-content-end list-unstyled m-0 align-items-center">
              <li>
                <button
                  type="button"
                  className="p-2 mx-1 btn btn-link"
                  onClick={handleUserClick}
                  aria-label={user ? "My Account" : "Login"}
                >
                  <svg width="24" height="24">
                    <use xlinkHref="#user"></use>
                  </svg>
                  {user ? (
                    <span className="ms-1">{user.username || user.name || user.email}</span>
                  ) : (
                    <span className="ms-1">Login</span>
                  )}
                </button>
                {user && (
                  <button
                    type="button"
                    className="btn btn-link p-0 ms-2 text-danger"
                    onClick={handleLogout}
                    style={{fontSize: '0.9em'}}
                  >
                    Logout
                  </button>
                )}
              </li>
              {/* Wishlist Button with Dropdown and Remove */}
              <li ref={wishlistDropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="p-2 mx-1 btn btn-link position-relative"
                  onClick={() => setShowWishlistDropdown(v => !v)}
                  aria-label="Wishlist"
                >
                  <svg width="24" height="24">
                    <use xlinkHref="#wishlist"></use>
                  </svg>
                  {wishlistProducts.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {wishlistProducts.length}
                    </span>
                  )}
                </button>
                {showWishlistDropdown && (
                  <ul
                    className="dropdown-menu show p-2"
                    style={{
                      display: 'block',
                      position: 'absolute',
                      right: 0,
                      minWidth: 220,
                      maxHeight: 320,
                      overflowY: 'auto',
                      zIndex: 2000
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
                  </ul>
                )}
              </li>
              <li>
                <button
                  type="button"
                  className="p-2 mx-1 btn btn-link position-relative"
                  onClick={() => navigate('/cart')}
                  aria-label="Cart"
                >
                  <svg width="24" height="24">
                    <use xlinkHref="#shopping-bag"></use>
                  </svg>
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {cartCount}
                    </span>
                  )}
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;
