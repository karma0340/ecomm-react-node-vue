import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.svg';
import AuthModal from './AuthModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Header({ user, cartCount, fetchUserAndCart }) {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

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

          {/* Logo and Menu Button */}
          <div className="col-sm-4 col-lg-2 text-center text-sm-start d-flex gap-3 justify-content-center justify-content-md-start">
            <div className="d-flex align-items-center my-3 my-sm-0">
              <a href="/">
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
              </a>
            </div>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasNavbar"
              aria-controls="offcanvasNavbar"
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <use xlinkHref="#menu"></use>
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="col-sm-6 offset-sm-2 offset-md-0 col-lg-4">
            <div className="search-bar row bg-light p-2 rounded-4">
              <div className="col-md-4 d-none d-md-block">
                <select className="form-select border-0 bg-transparent">
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Appliances</option>
                  <option>Fashion</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div className="col-11 col-md-7">
                <form id="search-form" className="text-center" action="/" method="get">
                  <input
                    type="text"
                    className="form-control border-0 bg-transparent"
                    placeholder="Search for more than 20,000 products"
                  />
                </form>
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
              <li className="nav-item active">
                <a href="/" className="nav-link">Home</a>
              </li>
              <li className="nav-item dropdown">
                <button
                  className="nav-link dropdown-toggle pe-3 btn btn-link"
                  type="button"
                  id="pages"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ textDecoration: 'none' }}
                >
                  Pages
                </button>
                <ul className="dropdown-menu border-0 p-3 rounded-0 shadow" aria-labelledby="pages">
                  <li><a href="/about" className="dropdown-item">About Us</a></li>
                  <li><a href="/shop" className="dropdown-item">Shop</a></li>
                  <li><a href="/product/1" className="dropdown-item">Single Product</a></li>
                  <li><a href="/cart" className="dropdown-item">Cart</a></li>
                  <li><a href="/checkout" className="dropdown-item">Checkout</a></li>
                  <li><a href="/blog" className="dropdown-item">Blog</a></li>
                  <li><a href="/post/1" className="dropdown-item">Single Post</a></li>
                  <li><a href="/styles" className="dropdown-item">Styles</a></li>
                  <li><a href="/contact" className="dropdown-item">Contact</a></li>
                  <li><a href="/thank-you" className="dropdown-item">Thank You</a></li>
                  <li><a href="/account" className="dropdown-item">My Account</a></li>
                  <li><a href="/404" className="dropdown-item">404 Error</a></li>
                </ul>
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
              <li>
                <button type="button" className="p-2 mx-1 btn btn-link">
                  <svg width="24" height="24">
                    <use xlinkHref="#wishlist"></use>
                  </svg>
                </button>
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
