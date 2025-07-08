const express = require('express');
const router = express.Router();
const db = require('../../models');
const bcrypt = require('bcrypt');

// Helper: Get total orders for a user
async function getTotalOrdersForUser(userId) {
  return db.Order.count({ where: { userId } });
}

// Helper: Get recent activities for a user (latest 3, real data)
async function getRecentActivitiesForUser(userId) {
  const activities = await db.Activity.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
    limit: 3,
    attributes: ['action', 'createdAt'],
    raw: true
  });
  return activities.map(a => `${a.action} (${new Date(a.createdAt).toLocaleString()})`);
}

// Helper: Get monthly stats for chart (includes categories and subcategories)
async function getMonthlyStats() {
  // Orders and sales per month (last 12 months)
  const orders = await db.Order.findAll({
    attributes: [
      [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'month'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount'],
      [db.sequelize.fn('SUM', db.sequelize.col('total')), 'sales'] // <-- Make sure 'total' is your sales column!
    ],
    group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m')],
    order: [[db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
    raw: true
  });

  // New users per month
  const users = await db.User.findAll({
    attributes: [
      [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'month'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'userCount']
    ],
    group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m')],
    order: [[db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
    raw: true
  });

  // Categories per month
  const categories = await db.Category.findAll({
    attributes: [
      [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'month'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'categoryCount']
    ],
    group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m')],
    order: [[db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
    raw: true
  });

  // Subcategories per month
  const subcategories = await db.SubCategory.findAll({
    attributes: [
      [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'month'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'subcategoryCount']
    ],
    group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m')],
    order: [[db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
    raw: true
  });

  // Merge all unique months
  const monthsSet = new Set([
    ...orders.map(o => o.month),
    ...users.map(u => u.month),
    ...categories.map(c => c.month),
    ...subcategories.map(s => s.month)
  ]);
  const months = Array.from(monthsSet).sort();

  const orderMap = Object.fromEntries(orders.map(o => [o.month, {
    orders: parseInt(o.orderCount),
    sales: parseFloat(o.sales)
  }]));
  const userMap = Object.fromEntries(users.map(u => [u.month, parseInt(u.userCount)]));
  const categoryMap = Object.fromEntries(categories.map(c => [c.month, parseInt(c.categoryCount)]));
  const subcategoryMap = Object.fromEntries(subcategories.map(s => [s.month, parseInt(s.subcategoryCount)]));

  return {
    labels: months,
    orders: months.map(m => orderMap[m]?.orders || 0),
    sales: months.map(m => orderMap[m]?.sales || 0),
    users: months.map(m => userMap[m] || 0),
    categories: months.map(m => categoryMap[m] || 0),
    subcategories: months.map(m => subcategoryMap[m] || 0)
  };
}

// Admin Dashboard (HTML page)
router.get('/', async (req, res) => {
  try {
    // Fetch stats from DB
    const [
      usersCount,
      productsCount,
      ordersCount,
      categoriesCount,
      subcategoriesCount,
      totalSales,
      usersRaw
    ] = await Promise.all([
      db.User.count(),
      db.Product.count(),
      db.Order.count(),
      db.Category.count(),
      db.SubCategory.count(),
      db.Order.sum('total'), // or 'totalAmount' or whatever your sales field is
      db.User.findAll({
        attributes: ['id', 'name', 'email', 'role', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 10,
        raw: true
      })
    ]);

    // Fetch per-user stats and activities
    const users = await Promise.all(usersRaw.map(async user => ({
      ...user,
      totalOrders: await getTotalOrdersForUser(user.id),
      activities: await getRecentActivitiesForUser(user.id),
      registered: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      new: (new Date() - new Date(user.createdAt)) < 7 * 24 * 60 * 60 * 1000 // New if registered within 7 days
    })));

    res.render('dashboard', {
      layout: 'main',
      title: 'Admin Dashboard',
      user: req.user || { name: 'Admin' },
      stats: {
        users: usersCount,
        products: productsCount,
        orders: ordersCount,
        categories: categoriesCount,
        subcategories: subcategoriesCount,
        sales: totalSales || 0
      },
      users
      // Chart data is now fetched by AJAX, not rendered here!
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error' });
  }
});

// Chart Data API for AJAX chart
router.get('/chart-data', async (req, res) => {
  try {
    const chartData = await getMonthlyStats();
    res.json(chartData);
  } catch (err) {
    console.error('Chart data error:', err);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Add User (show form)
router.get('/users/add', (req, res) => {
  res.render('userAdd', { layout: 'main', title: 'Add User' });
});

// Add User (handle form)
router.post('/users/add', async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.User.create({ name, email, role, password: hashedPassword });
    res.redirect('/admin');
  } catch (err) {
    console.error('Add user error:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error' });
  }
});

// Export Users (CSV)
router.get('/users/export', async (req, res) => {
  try {
    const users = await db.User.findAll({ attributes: ['id', 'name', 'email', 'role'], raw: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.send('id,name,email,role\n' + users.map(u => `${u.id},${u.name},${u.email},${u.role}`).join('\n'));
  } catch (err) {
    console.error('Export users error:', err);
    res.status(500).send('Failed to export users');
  }
});

module.exports = router;
