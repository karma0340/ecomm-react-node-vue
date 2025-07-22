const express = require('express');
const router = express.Router();
const db = require('../../models');
const isAdmin = require('../../middleware/isAdmin');

// ===== Render the Dashboard Page (for browser) =====
router.get('/dashboard', isAdmin, async (req, res) => {
  let stats = {};
  let recentUsers = [];
  try {
    stats = {
      users: await db.User.count(),
      products: await db.Product.count(),
      categories: await db.Category.count(),
      subcategories: await db.SubCategory.count(),
      sales: (await db.Order.sum('total')) || 0
    };
    recentUsers = await db.User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      raw: true
    });
  } catch (err) {
    console.error('Dashboard SSR data error:', err);
  }

  res.render('dashboard', {
    layout: 'main',
    title: 'Admin Dashboard',
    isDashboard: true,
    isVueHeader: true, // <<== Key: tells layout to use Vue header (and load vue-header.js/CSS)
    user: req.user || { name: 'Admin' },
    stats,
    recentUsers
  });
});

// ===== Helper: Monthly Stats for Chart (Orders & User Registrations) =====
async function getMonthlyStats() {
  const orders = await db.Order.findAll({
    attributes: [
      [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'month'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'orderCount'],
      [db.sequelize.fn('SUM', db.sequelize.col('total')), 'sales']
    ],
    group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m')],
    order: [[db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
    raw: true
  });

  const users = await db.User.findAll({
    attributes: [
      [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'month'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'userCount']
    ],
    group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m')],
    order: [[db.sequelize.fn('DATE_FORMAT', db.sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
    raw: true
  });

  const monthsSet = new Set([
    ...orders.map(o => o.month),
    ...users.map(u => u.month)
  ]);
  const months = Array.from(monthsSet).sort();

  const orderMap = Object.fromEntries(orders.map(o => [o.month, {
    orders: parseInt(o.orderCount) || 0,
    sales: parseFloat(o.sales) || 0
  }]));
  const userMap = Object.fromEntries(users.map(u => [u.month, parseInt(u.userCount) || 0]));

  return {
    labels: months,
    orders: months.map(m => orderMap[m]?.orders ?? 0),
    sales: months.map(m => orderMap[m]?.sales ?? 0),
    users: months.map(m => userMap[m] ?? 0)
  };
}

// ===== Helper: Sparkline Data =====
async function getSparklineData() {
  const days = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (23 - i));
    return d.toISOString().slice(0, 10);
  });

  const salesRaw = await db.Order.findAll({
    attributes: [
      [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'day'],
      [db.sequelize.fn('SUM', db.sequelize.col('total')), 'sales']
    ],
    where: { createdAt: { [db.Sequelize.Op.gte]: days[0] } },
    group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
    order: [[db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'ASC']],
    raw: true
  });
  const salesMap = Object.fromEntries(salesRaw.map(r => [r.day, parseFloat(r.sales)]));
  const sales = days.map(d => salesMap[d] || 0);

  const expenses = sales.map(s => Math.round(s * (0.4 + Math.random() * 0.2)));
  const profits = sales.map((s, i) => Math.max(0, s - expenses[i]));

  const salesAmount = sales.reduce((a, b) => a + b, 0);
  const expensesAmount = expenses.reduce((a, b) => a + b, 0);
  const profitsAmount = profits.reduce((a, b) => a + b, 0);

  return {
    sales,
    expenses,
    profits,
    salesAmount,
    expensesAmount,
    profitsAmount
  };
}

// ===== Helper: Bar Data (Monthly Sales by Category) =====
async function getBarData() {
  const months = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (13 - i));
    return d.toISOString().slice(0, 7);
  });

  const categories = await db.Category.findAll({ attributes: ['id', 'name'], order: [['id', 'ASC']], raw: true });

  const series = [];
  for (const cat of categories) {
    const salesRaw = await db.OrderItem.findAll({
      include: [
        {
          model: db.Product,
          as: 'product',
          attributes: [],
          where: { categoryId: cat.id },
          required: true
        },
        {
          model: db.Order,
          as: 'order',
          attributes: []
        }
      ],
      attributes: [
        [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('order.createdAt'), '%Y-%m'), 'month'],
        [db.sequelize.fn('SUM', db.sequelize.col('OrderItem.price')), 'sales']
      ],
      group: [db.sequelize.fn('DATE_FORMAT', db.sequelize.col('order.createdAt'), '%Y-%m')],
      raw: true
    });

    const salesMap = Object.fromEntries(salesRaw.map(r => [r.month, parseFloat(r.sales)]));
    series.push({
      name: cat.name,
      data: months.map(m => salesMap[m] || 0)
    });
  }
  return { series, months };
}

// ===== Helper: Donut Data (Category Sales) =====
async function getDonutData() {
  const categories = await db.Category.findAll({ attributes: ['id', 'name'], order: [['id', 'ASC']], raw: true });

  const salesRaw = await db.OrderItem.findAll({
    include: [
      {
        model: db.Product,
        as: 'product',
        attributes: ['categoryId'],
        required: true
      }
    ],
    attributes: [
      [db.sequelize.col('product.categoryId'), 'categoryId'],
      [db.sequelize.fn('SUM', db.sequelize.col('OrderItem.price')), 'sales']
    ],
    group: [db.sequelize.col('product.categoryId')],
    raw: true
  });

  const salesMap = Object.fromEntries(salesRaw.map(r => [String(r.categoryId), parseFloat(r.sales)]));
  const labels = [];
  const series = [];
  for (const cat of categories) {
    labels.push(cat.name);
    series.push(salesMap[String(cat.id)] || 0);
  }

  return { series, labels };
}

// ===== Helper: Area Data (Daily Unique Logins for Admin & User) =====
async function getAreaData() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const roles = ['admin', 'user'];
  const series = [];

  for (const role of roles) {
    const counts = await db.UserLogin.findAll({
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: [],
          where: { role },
          required: true
        }
      ],
      attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('UserLogin.createdAt')), 'day'],
        [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('UserLogin.userId'))), 'count']
      ],
      where: {
        createdAt: { [db.Sequelize.Op.gte]: days[0] }
      },
      group: [db.sequelize.fn('DATE', db.sequelize.col('UserLogin.createdAt'))],
      raw: true
    });

    const dayMap = Object.fromEntries(counts.map(r => [r.day, parseInt(r.count)]));
    series.push({
      name: role === 'admin' ? 'Admin' : 'User',
      data: days.map(day => ({ x: day, y: dayMap[day] || 0 }))
    });
  }

  return { series };
}

// ===== Helper: Line Data (Multi-line: New, Returning, Total Customers) =====
async function getLineData() {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const newCustomers = await db.User.findAll({
    attributes: [
      [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'day'],
      [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
    ],
    where: { createdAt: { [db.Sequelize.Op.gte]: days[0] } },
    group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
    raw: true
  });

  const totalCustomers = await db.Order.findAll({
    attributes: [
      [db.sequelize.fn('DATE', db.sequelize.col('createdAt')), 'day'],
      [db.sequelize.fn('COUNT', db.sequelize.fn('DISTINCT', db.sequelize.col('userId'))), 'count']
    ],
    where: { createdAt: { [db.Sequelize.Op.gte]: days[0] } },
    group: [db.sequelize.fn('DATE', db.sequelize.col('createdAt'))],
    raw: true
  });

  const newMap = Object.fromEntries(newCustomers.map(r => [r.day, parseInt(r.count)]))
  const totalMap = Object.fromEntries(totalCustomers.map(r => [r.day, parseInt(r.count)]))
  const returningMap = {}
  days.forEach(day => {
    returningMap[day] = (totalMap[day] || 0) - (newMap[day] || 0)
  })

  return {
    series: [
      { name: "New Customers", data: days.map(day => newMap[day] || 0) },
      { name: "Returning Customers", data: days.map(day => returningMap[day] || 0) },
      { name: "Total Customers", data: days.map(day => totalMap[day] || 0) }
    ],
    labels: days,
    subtitle: "Active, new and returning customers in the last 7 days"
  }
}

// ===== API: Dashboard Summary Stats =====
router.get('/dashboard/stats', isAdmin, async (req, res) => {
  try {
    const [
      usersCount,
      productsCount,
      categoriesCount,
      subcategoriesCount,
      salesTotal
    ] = await Promise.all([
      db.User.count(),
      db.Product.count(),
      db.Category.count(),
      db.SubCategory.count(),
      db.Order.sum('total')
    ]);
    res.json({
      users: usersCount,
      products: productsCount,
      categories: categoriesCount,
      subcategories: subcategoriesCount,
      sales: salesTotal || 0
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ===== API: Sparkline Data =====
router.get('/dashboard/sparkline-data', isAdmin, async (req, res) => {
  try {
    const data = await getSparklineData();
    res.json(data);
  } catch (err) {
    console.error('Sparkline data error:', err);
    res.status(500).json({ error: 'Failed to fetch sparkline data' });
  }
});

// ===== API: Bar Data =====
router.get('/dashboard/bar-data', isAdmin, async (req, res) => {
  try {
    const data = await getBarData();
    res.json(data);
  } catch (err) {
    console.error('Bar data error:', err);
    res.status(500).json({ error: 'Failed to fetch bar data' });
  }
});

// ===== API: Donut Data =====
router.get('/dashboard/donut-data', isAdmin, async (req, res) => {
  try {
    const data = await getDonutData();
    res.json(data);
  } catch (err) {
    console.error('Donut data error:', err);
    res.status(500).json({ error: 'Failed to fetch donut data' });
  }
});

// ===== API: Area Data =====
router.get('/dashboard/area-data', isAdmin, async (req, res) => {
  try {
    const data = await getAreaData();
    res.json(data);
  } catch (err) {
    console.error('Area data error:', err);
    res.status(500).json({ error: 'Failed to fetch area data' });
  }
});

// ===== API: Line Data (Customers) =====
router.get('/dashboard/line-data', isAdmin, async (req, res) => {
  try {
    const data = await getLineData();
    res.json(data);
  } catch (err) {
    console.error('Line data error:', err);
    res.status(500).json({ error: 'Failed to fetch line data' });
  }
});

// ===== API: Chart Data (Orders & Users per Month) =====
router.get('/dashboard/chart-data', isAdmin, async (req, res) => {
  try {
    const chartData = await getMonthlyStats();
    res.json(chartData);
  } catch (err) {
    console.error('Chart data error:', err);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// ===== API: Recent Customers (for Vue dashboard) =====
router.get('/dashboard/recent-customers', isAdmin, async (req, res) => {
  try {
    const recentCustomers = await db.User.findAll({
      order: [['createdAt', 'DESC']],
      limit: 5,
      raw: true
    });
    res.json(recentCustomers);
  } catch (err) {
    console.error('Recent customers error:', err);
    res.status(500).json([]);
  }
});

module.exports = router;
