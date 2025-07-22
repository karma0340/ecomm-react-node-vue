'use strict';

// Helper to check each router
function mustBeRouter(name, value) {
  if (typeof value !== 'function') {
    console.error(
      `[FATAL] admin/routes/index.js: The export "${name}" is type "${typeof value}", expected "function".\n` + 
      `-> Check ./admin/routes/${name}.js for existence and correct export!\n`
    );
    process.exit(1); // Force fail and stop on bad export
  } else {
    console.log(`[OK] ${name}: function`);
  }
}

const adminRoutes = require('./admin');
mustBeRouter('admin', adminRoutes);

const adminAuthRoutes = require('./adminAuthRoutes');
mustBeRouter('adminAuthRoutes', adminAuthRoutes);

const adminDashboardRoutes = require('./adminDashboard');
mustBeRouter('adminDashboard', adminDashboardRoutes);

const productAdminRoutes = require('./productAdminRoutes');
mustBeRouter('productAdminRoutes', productAdminRoutes);

const ordersRoutes = require('./ordersRoutes');
mustBeRouter('ordersRoutes', ordersRoutes);

const categoriesRoutes = require('./categoriesRoutes');
mustBeRouter('categoriesRoutes', categoriesRoutes);

const subcategoriesRoutes = require('./subcategoriesRoutes');
mustBeRouter('subcategoriesRoutes', subcategoriesRoutes);

const userAdminRoutes = require('./userAdminRoutes');
mustBeRouter('userAdminRoutes', userAdminRoutes);

// const notificationsRoutes = require('./notificationsRoutes');
// mustBeRouter('notifications', notificationsRoutes);

module.exports = {
  adminRoutes,
  adminAuthRoutes,
  adminDashboardRoutes,
  productAdminRoutes,
  ordersRoutes,
  categoriesRoutes,
  subcategoriesRoutes,
  userAdminRoutes,
  
//   notificationsRoutes,
};
