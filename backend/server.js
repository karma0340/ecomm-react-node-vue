'use strict';
const path = require('path');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models'); // Sequelize models and connection
const routes = require('./routes'); // Centralized route imports

const app = express();

// ===== CORS Setup =====
const corsOptions = {
  origin: 'http://localhost:3001',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ===== Middleware =====
// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Parse JSON bodies
app.use(express.json());

// ===== Static File Serving =====
app.use('/images/products', express.static(path.join(__dirname, 'public/images/products')));
app.use('/images/categories', express.static(path.join(__dirname, 'public/images/categories')));

// ===== Route Mounting (Centralized) =====
app.use('/api/auth', routes.authRoutes);
app.use('/api/users', routes.userRoutes);
app.use('/api/categories', routes.categoryRoutes);
app.use('/api/subcategories', routes.subcategoryRoutes);
app.use('/api/products', routes.productRoutes);
app.use('/api/cart', routes.cartRoutes); // Cart and CartItem can be the same
app.use('/api/favourites', routes.favouriteRoutes);
app.use('/api/orders', routes.orderRoutes);
app.use('/api/protected', routes.protectedRoutes);
app.use('/api/cart/items', routes.cartItemRoutes); // Cart items management
// ===== 404 Handler =====
app.use((req, res, next) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===== Database Sync & Server Start =====
db.sequelize.sync()
  .then(() => {
    console.log('Database synchronized successfully');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Access the API at: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to sync database:', err);
    if (err.original) {
      console.error('Original error details:', err.original);
    }
  });

module.exports = app;
