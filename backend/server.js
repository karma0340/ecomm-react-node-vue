'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();

// ===== View Engine & Static Files =====
app.engine('hbs', exphbs.engine({
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'admin', 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'admin', 'views', 'partials'),
  defaultLayout: 'main',
  helpers: {
    eq: (a, b) => a === b,
    or: (a, b) => a || b,
    formatDate: function(value, format) {
      if (format === "currency") {
        return Number(value || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
      }
      if (!value) return '';
      const d = new Date(value);
      if (format === 'date') {
        return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' });
      }
      if (format === 'time') {
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'admin', 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// ===== Middleware =====
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Session Setup =====
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// ===== CORS Setup =====
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200
}));

// ===== Logging Middleware =====
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ===== Make user available to all views =====
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ===== Route Imports =====
const routes = require('./routes');
const adminAuthRoutes = require('./admin/routes/adminAuthRoutes');
const adminDashboardRoutes = require('./admin/routes/adminDashboard');
const productWebRoutes = require('./admin/routes/productsRoutes');
const orderWebRoutes = require('./admin/routes/ordersRoutes');
const categoryWebRoutes = require('./admin/routes/categoriesRoutes');
const subcategoryWebRoutes = require('./admin/routes/subcategoriesRoutes');
const userWebRoutes = require('./admin/routes/usersRoutes');
const notificationsRoutes = require('./admin/routes/notifications');

// ===== API Routes =====
app.use('/api/auth', routes.authRoutes);
app.use('/api/users', routes.userRoutes);
app.use('/api/categories', routes.categoryRoutes);
app.use('/api/subcategories', routes.subcategoryRoutes);
app.use('/api/products', routes.productRoutes);
app.use('/api/favourites', routes.favouriteRoutes);
app.use('/api/orders', routes.orderRoutes);
app.use('/api/protected', routes.protectedRoutes);
app.use('/api/cart/items', routes.cartItemRoutes);

// ===== Wishlist API Route (Sequelize version) =====
const wishlistRoutes = require('./routes/wishlistRoutes');
app.use('/api/wishlist', wishlistRoutes);

// ===== Optional Payment Route =====
try {
  app.use('/api/payment', require('./routes/paymentRoutes'));
} catch (e) {
  console.warn('Payment routes not found or not used.');
}

// ===== Admin Panel Auth Routes (Login/Logout) =====
app.use('/admin', adminAuthRoutes);

// ===== Admin Panel Web Routes (Protected) =====
const isAdmin = require('./middleware/isAdmin');
app.use('/admin', isAdmin, adminDashboardRoutes);
app.use('/products', isAdmin, productWebRoutes);
app.use('/orders', isAdmin, orderWebRoutes);
app.use('/categories', isAdmin, categoryWebRoutes);
app.use('/subcategories', isAdmin, subcategoryWebRoutes);
app.use('/users', isAdmin, userWebRoutes);

// ===== Notifications Route for Admin Panel =====
app.use('/api/notifications', notificationsRoutes);

// ===== SEARCH ROUTE (MySQL compatible) =====
const { Op } = require('sequelize');
const db = require('./models');
app.get('/search', async (req, res) => {
  const q = req.query.q ? req.query.q.trim() : '';
  if (!q) {
    return res.render('searchResults', { title: 'Search', query: '', results: { users: [], products: [] } });
  }

  try {
    const [users, products] = await Promise.all([
      db.User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } }
          ]
        },
        raw: true
      }),
      db.Product.findAll({
        where: {
          name: { [Op.like]: `%${q}%` }
        },
        raw: true
      })
    ]);

    res.render('searchResults', {
      title: 'Search Results',
      query: q,
      results: { users, products }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});

// ===== Logout Route =====
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin');
  });
});

// ===== 404 Handler =====
app.use((req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).render('404', { layout: 'main', title: 'Not Found', user: req.user });
  }
  res.status(404).json({ error: 'API endpoint not found' });
});

// ===== 500 Error Handler =====
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (req.accepts('html')) {
    return res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// ===== Database Sync & Server Start =====
const sequelize = db.sequelize;
sequelize.sync()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
    if (err.original) {
      console.error('Original error details:', err.original);
    }
  });

module.exports = app;
