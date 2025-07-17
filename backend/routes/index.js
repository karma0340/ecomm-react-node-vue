

const authRoutes = require('./authRoutes');

const categoryRoutes = require('./categoryRoutes');
const favouriteRoutes = require('./favouriteRoutes');
const orderRoutes = require('./orderRoutes');
const productRoutes = require('./productRoutes');     // API routes
const productsRoutes = require('../admin/routes/productAdminRoutes');   // Admin/web routes
const protectedRoutes = require('./protectedRoutes');
const subcategoryRoutes = require('./subcategoryRoutes');
const userRoutes = require('./userRoutes');
const cartItemRoutes = require('./cartItemRoutes');
const notificationsRouter = require('../admin/routes/notifications');
module.exports = {
  authRoutes,
  categoryRoutes,
  favouriteRoutes,
  orderRoutes,
  productRoutes,    // /api/products
  productsRoutes,   // /products
  protectedRoutes,
  subcategoryRoutes,
  userRoutes,
  cartItemRoutes,
  notificationsRouter
};
