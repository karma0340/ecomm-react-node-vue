// const express = require('express');
// const router = express.Router();
// const db = require('../models');
// const { Op, fn, col } = require('sequelize');
// const authJwt = require('../middleware/authJwt');
// const isAdmin = require('../middleware/isAdmin');

// // Admin dashboard route: GET /admin
// router.get('/', authJwt, isAdmin, async (req, res) => {
//   try {
//     // Dashboard stats
//     const stats = {
//       users: await db.User.count(),
//       products: await db.Product.count(),
//       orders: await db.Order.count()
//     };

//     // Chart data for the current year
//     const currentYear = new Date().getFullYear();
//     const months = [
//       'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
//       'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//     ];

//     // Orders per month
//     const ordersPerMonthRaw = await db.Order.findAll({
//       attributes: [
//         [fn('MONTH', col('createdAt')), 'month'],
//         [fn('COUNT', col('id')), 'count']
//       ],
//       where: {
//         createdAt: {
//           [Op.gte]: new Date(`${currentYear}-01-01`),
//           [Op.lt]: new Date(`${currentYear + 1}-01-01`)
//         }
//       },
//       group: [fn('MONTH', col('createdAt'))],
//       order: [[fn('MONTH', col('createdAt')), 'ASC']]
//     });
//     const ordersPerMonth = Array(12).fill(0);
//     ordersPerMonthRaw.forEach(row => {
//       const monthIdx = parseInt(row.get('month'), 10) - 1;
//       ordersPerMonth[monthIdx] = parseInt(row.get('count'), 10);
//     });

//     // Sales per month (sum of order totals)
//     const salesPerMonthRaw = await db.Order.findAll({
//       attributes: [
//         [fn('MONTH', col('createdAt')), 'month'],
//         [fn('SUM', col('total')), 'total']
//       ],
//       where: {
//         createdAt: {
//           [Op.gte]: new Date(`${currentYear}-01-01`),
//           [Op.lt]: new Date(`${currentYear + 1}-01-01`)
//         }
//       },
//       group: [fn('MONTH', col('createdAt'))],
//       order: [[fn('MONTH', col('createdAt')), 'ASC']]
//     });
//     const salesPerMonth = Array(12).fill(0);
//     salesPerMonthRaw.forEach(row => {
//       const monthIdx = parseInt(row.get('month'), 10) - 1;
//       salesPerMonth[monthIdx] = parseFloat(row.get('total')) || 0;
//     });

//     // New users per month
//     const usersPerMonthRaw = await db.User.findAll({
//       attributes: [
//         [fn('MONTH', col('createdAt')), 'month'],
//         [fn('COUNT', col('id')), 'count']
//       ],
//       where: {
//         createdAt: {
//           [Op.gte]: new Date(`${currentYear}-01-01`),
//           [Op.lt]: new Date(`${currentYear + 1}-01-01`)
//         }
//       },
//       group: [fn('MONTH', col('createdAt'))],
//       order: [[fn('MONTH', col('createdAt')), 'ASC']]
//     });
//     const usersPerMonth = Array(12).fill(0);
//     usersPerMonthRaw.forEach(row => {
//       const monthIdx = parseInt(row.get('month'), 10) - 1;
//       usersPerMonth[monthIdx] = parseInt(row.get('count'), 10);
//     });

//     // Fetch users with their orders and their 3 most recent activities
//     const dbUsers = await db.User.findAll({
//       include: [
//         {
//           model: db.Order,
//           as: 'orders',
//           required: false
//         },
//         {
//           model: db.Activity,
//           as: 'activities',
//           required: false,
//           limit: 3,
//           order: [['createdAt', 'DESC']]
//         }
//       ]
//     });

//     // Map users for dashboard table
//     const users = dbUsers.map(u => ({
//       user: {
//         name: u.name || u.username,
//         username: u.username,
//         email: u.email,
//         role: u.role,
//         totalOrders: u.orders ? u.orders.length : 0,
//         new: u.isNew || false,
//         registered: u.createdAt ? u.createdAt.toLocaleDateString() : ''
//       },
//       activities: (u.activities && u.activities.length)
//         ? u.activities.map(a => `${a.action} (${a.createdAt.toLocaleString()})`)
//         : ['No recent activity']
//     }));

//     res.render('dashboard', {
//       layout: 'main',
//       title: 'Admin Dashboard',
//       user: req.user,
//       stats,
//       users,
//       chartLabels: JSON.stringify(months),
//       chartOrders: JSON.stringify(ordersPerMonth),
//       chartSales: JSON.stringify(salesPerMonth),
//       chartUsers: JSON.stringify(usersPerMonth)
//     });
//   } catch (err) {
//     console.error('Error rendering admin dashboard:', err);
//     res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
//   }
// });

// module.exports = router;
