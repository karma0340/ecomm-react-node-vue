'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');

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
    json: context => JSON.stringify(context),
    formatDate: function (value, format) {
      if (format === "currency") {
        return Number(value || 0).toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        });
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

// ===== Static Files =====
// === The most important line for your Vue/Vite assets ===
app.use('/admin/dist', express.static(path.join(__dirname, 'dist')));

// You can keep this for legacy
app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
  cookie: { secure: false } // true if using HTTPS
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

// ===== Vite Manifest (optional if using hashes) =====
const viteManifestPath = path.join(__dirname, 'dist', 'manifest.json');
let viteManifest = {};
if (fs.existsSync(viteManifestPath)) {
  viteManifest = JSON.parse(fs.readFileSync(viteManifestPath, 'utf-8'));
}
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.viteManifest = viteManifest || {};
  next();
});

// ===== Sequelize ORM Setup =====
const db = require('./models');
const { Op } = require('sequelize');

// ===== isAdmin Middleware =====
function isAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  return res.status(403).render('adminLogin', {
    layout: 'main',
    title: 'Admin Login',
    isAdminLogin: true,
    error: 'You must be an authenticated admin to view this page.'
  });
}

// ===== Internal Route Files =====
const routes = require('./routes');
const adminAuthRoutes = require('./admin/routes/adminAuthRoutes');
const adminDashboardRoutes = require('./admin/routes/adminDashboard');
const productWebRoutes = require('./admin/routes/productAdminRoutes');
const orderWebRoutes = require('./admin/routes/ordersRoutes');
const categoryWebRoutes = require('./admin/routes/categoriesRoutes');
const subcategoryWebRoutes = require('./admin/routes/subcategoriesRoutes');
const userWebRoutes = require('./admin/routes/userAdminRoutes'); // SSR Admin
const userApiRoutes = require('./routes/users'); // API Routes (JSON)
const notificationsRoutes = require('./admin/routes/notifications');
const wishlistRoutes = require('./routes/wishlistRoutes');

// ===== API Routes =====
app.use('/api/auth', routes.authRoutes);
app.use('/api/users', userApiRoutes); // ✅ JSON only
app.use('/api/categories', routes.categoryRoutes);
app.use('/api/subcategories', routes.subcategoryRoutes);
app.use('/api/products', routes.productRoutes);
app.use('/api/favourites', routes.favouriteRoutes);
app.use('/api/orders', routes.orderRoutes);
app.use('/api/protected', routes.protectedRoutes);
app.use('/api/cart/items', routes.cartItemRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/notifications', notificationsRoutes);

try {
  app.use('/api/payment', require('./routes/paymentRoutes'));
} catch (e) {
  console.warn('Payment routes not found or not used.');
}

// ===== Admin Auth Routes =====
app.use('/admin', adminAuthRoutes);

// ===== Admin Dashboard Web (Vue + HBS SSR App) =====
app.use('/admin', adminDashboardRoutes);

// ===== Admin Panel Views (HBS + Vue Hydrated Pages) =====
app.use('/products', isAdmin, productWebRoutes);
app.use('/orders', isAdmin, orderWebRoutes);
app.use('/categories', isAdmin, categoryWebRoutes);
app.use('/subcategories', isAdmin, subcategoryWebRoutes);
app.use('/users', isAdmin, userWebRoutes); // ✅ SSR admin user page

// ===== /admin (login redirecting) =====
app.get('/admin', (req, res) => {
  return req.session?.user?.role === 'admin'
    ? res.redirect('/admin/dashboard')
    : res.redirect('/admin/login');
});

// ===== Search =====
app.get('/search', async (req, res) => {
  const q = req.query.q?.trim();
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
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.session.user });
  }
});

// ===== 404 Handler =====
app.use((req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).render('404', {
      layout: 'main',
      title: 'Not Found',
      user: req.session.user
    });
  }
  return res.status(404).json({ error: 'API endpoint not found' });
});

// ===== 500 Error Handler =====
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (req.accepts('html')) {
    return res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.session.user
    });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// ===== Database Sync & Start =====
const sequelize = db.sequelize;

sequelize.sync()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🔐 Admin Panel at → http://localhost:${PORT}/admin`);
    });
  })
  .catch(err => {
    console.error('⛔ Failed to sync database:', err);
    if (err.original) {
      console.error('Original DB error:', err.original);
    }
  });

module.exports = app;
