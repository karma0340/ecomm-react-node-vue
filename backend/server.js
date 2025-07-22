'use strict';

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');
const sharp = require('sharp');
const db = require('./models');
const getUpload = require('./middleware/upload');

// === Express app setup ===
const app = express();

// === View Engine & Static Files ===
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
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'admin', 'views'));

// === Static Files ===
app.use('/admin/dist', express.static(path.join(__dirname, 'dist')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// === Middleware ===
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// === Session Setup ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// === CORS Setup ===
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200
}));

// === Logging ===
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// === Vite Manifest Support ===
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

// ===== Middlewares: Auth Helpers =====
function isAdmin(req, res, next) {
  if (req.session?.user?.role === 'admin') return next();
  return res.status(403).render('adminLogin', {
    layout: 'main',
    title: 'Admin Login',
    isAdminLogin: true,
    error: 'You must be an authenticated admin to view this page.'
  });
}

function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

// ===== Import Route Aggregators =====
const routes = require('./routes');
const adminRouters = require('./admin/routes');

// ===== API ROUTES (RESTful) =====
app.use('/api/auth', routes.authRoutes);
app.use('/api/categories', routes.categoryRoutes);
app.use('/api/subcategories', routes.subcategoryRoutes);
app.use('/api/products', routes.productRoutes);
app.use('/api/favourites', routes.favouriteRoutes);
app.use('/api/orders', routes.orderRoutes);
app.use('/api/protected', routes.protectedRoutes);
app.use('/api/cart/items', routes.cartItemRoutes);
app.use('/api/users', routes.userRoutes);
app.use('/api/wishlist', routes.wishlistRoutes);
app.use('/api/users/me/addresses', routes.addressRoutes);
app.use('/api/payment', routes.paymentRoutes);
app.use('/api', routes.contactRoutes);

// ===== ADMIN PANEL ROUTES =====
app.use('/admin', adminRouters.adminAuthRoutes);
app.use('/admin', adminRouters.adminRoutes);
app.use('/admin', adminRouters.adminDashboardRoutes);
app.use('/products', isAdmin, adminRouters.productAdminRoutes);
app.use('/orders', isAdmin, adminRouters.ordersRoutes);
app.use('/categories', isAdmin, adminRouters.categoriesRoutes);
app.use('/subcategories', isAdmin, adminRouters.subcategoriesRoutes);
app.use('/users', isAdmin, adminRouters.userAdminRoutes);

// ===== Fuzzy Search (GET /search) =====
app.use('/', routes.searchRoutes);

// ===== /admin auto redirect =====
app.get('/admin', (req, res) => {
  return req.session?.user?.role === 'admin'
    ? res.redirect('/admin/dashboard')
    : res.redirect('/admin/login');
});

// ========== SSR USER PROFILE/SETTINGS ==========

app.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const userInstance = await db.User.findByPk(req.session.user.id);
    if (!userInstance) {
      return res.status(404).render('404', { layout: 'main', title: 'User Not Found' });
    }
    const user = userInstance.get({ plain: true });
    res.render('profile', { layout: 'main', title: 'Profile', user });
  } catch (err) {
    console.error('Error rendering profile:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error' });
  }
});

app.get('/settings', isLoggedIn, async (req, res) => {
  try {
    const userInstance = await db.User.findByPk(req.session.user.id);
    if (!userInstance) {
      return res.status(404).render('404', { layout: 'main', title: 'User Not Found' });
    }
    const user = userInstance.get({ plain: true });
    res.render('settings', { layout: 'main', title: 'Settings', user });
  } catch (err) {
    console.error('Error rendering settings:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error' });
  }
});

// SSR PROFILE UPDATE (uses /uploads/users)
const uploadSSR = getUpload('users');

app.post('/profile', isLoggedIn, uploadSSR.single('avatar'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateFields = { name, email };
    let avatarUrl;
    if (req.file) {
      const filepath = req.file.path;
      const tmpOutput = filepath + '-tmp';
      try {
        await sharp(filepath)
          .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toFile(tmpOutput);
        fs.unlinkSync(filepath);
        fs.renameSync(tmpOutput, filepath);
        avatarUrl = `/uploads/users/${req.file.filename}`;
        updateFields.avatar = avatarUrl;
        req.session.user.avatar = avatarUrl;
      } catch (sharpErr) {
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        console.error('[Sharp processing error]', sharpErr);
        return res.status(500).json({ success: false, error: 'Failed to process image' });
      }
    }
    await db.User.update(updateFields, { where: { id: req.session.user.id } });
    req.session.user.name = name;
    req.session.user.email = email;
    return res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    console.error('[Profile update error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

app.post('/settings', isLoggedIn, async (req, res) => {
  try {
    const { name, email } = req.body;
    await db.User.update({ name, email }, { where: { id: req.session.user.id }});
    const userInstance = await db.User.findByPk(req.session.user.id);
    const user = userInstance ? userInstance.get({ plain: true }) : {};
    res.render('settings', { layout: 'main', title: 'Settings', user, success: 'Settings updated!' });
  } catch (err) {
    console.error('Error updating settings:', err);
    let user = {};
    try {
      const userInstance = await db.User.findByPk(req.session.user.id);
      user = userInstance ? userInstance.get({ plain: true }) : {};
    } catch {}
    res.render('settings', { layout: 'main', title: 'Settings', user, error: 'Failed to update settings.' });
  }
});

// ===== 404 Handler =====
app.use((req, res, next) => {
  if (req.accepts('html')) {
    return res.status(404).render('404', {
      layout: 'main',
      title: 'Not Found',
      user: req.session.user,
    });
  }
  return res.status(404).json({ error: 'API endpoint not found' });
});

// ===== 500 Handler =====
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

// ===== DB Sync & Start =====
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
