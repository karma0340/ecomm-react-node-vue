'use strict';

// API Routes
const authRoutes         = require('./authRoutes');
const categoryRoutes     = require('./categoryRoutes');
const favouriteRoutes    = require('./favouriteRoutes');
const orderRoutes        = require('./orderRoutes');
const paymentRoutes      = require('./paymentRoutes');
const productRoutes      = require('./productRoutes');
const protectedRoutes    = require('./protectedRoutes');
const subcategoryRoutes  = require('./subcategoryRoutes');
const userRoutes         = require('./userRoutes');
const usersRoutes        = require('./users');            // Note: adjust if used for /api/users vs /users (web)
const cartItemRoutes     = require('./cartItemRoutes');
const wishlistRoutes     = require('./wishlistRoutes');
const addressRoutes     = require('./addressRoutes');
const contactRoutes      = require('./contactRoutes');    // Contact form route
// Admin/Web/SSR Routes (from admin/routes/)
const productsRoutes        = require('../admin/routes/productAdminRoutes');    // /products (admin panel views)
const notificationsRouter   = require('../admin/routes/notificationsRoutes');

// Search - Fuzzy search router
const searchRoutes = require('./search');

// Admin dashboard SSR
const adminRoutes = require('./admin');

// Export all routes as an object for easy importing in server.js
module.exports = {
  // API
  authRoutes,
  categoryRoutes,
  favouriteRoutes,
  orderRoutes,
  paymentRoutes,
  productRoutes,
  protectedRoutes,
  subcategoryRoutes,
  userRoutes,
  usersRoutes,
  cartItemRoutes,
  wishlistRoutes,
  addressRoutes,
  contactRoutes,         // Contact form route

  // Admin/Web
  productsRoutes,         // For SSR admin panel, e.g. /products
  notificationsRouter,
  adminRoutes,            // For admin dashboard/panel SSR

  // Extras
  searchRoutes
};
