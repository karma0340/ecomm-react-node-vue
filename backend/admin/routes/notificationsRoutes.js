// const express = require('express');
// const router = express.Router();
// const db = require('../../models'); // Adjust path as needed

// router.get('/', async (req, res) => {
//   // Use authenticated user if available, fallback to user 1 for demo
//   const userId = req.user?.id || 1;

//   try {
//     // If Notification model exists, fetch from DB
//     if (db.Notification && db.Notification.findAll) {
//       const notifications = await db.Notification.findAll({
//         where: { userId },
//         order: [['createdAt', 'DESC']],
//         limit: 10,
//         raw: true
//       });

//       if (notifications && notifications.length > 0) {
//         return res.json(
//           notifications.map(n => ({
//             title: n.title || 'Notification',
//             message: n.message,
//             time: n.createdAt
//               ? new Date(n.createdAt).toLocaleString()
//               : ''
//           }))
//         );
//       }
//     }
//     // Fallback: return sample notifications if no model/data
//     res.json([
//       { title: "New User Signup", message: "Alice just registered.", time: "1 min ago" },
//       { title: "Order Placed", message: "Order #1234 was placed.", time: "5 min ago" },
//       { title: "System", message: "Backup completed successfully.", time: "10 min ago" }
//     ]);
//   } catch (err) {
//     console.error('Failed to fetch notifications:', err);
//     res.status(500).json({ error: 'Failed to fetch notifications' });
//   }
// });

// module.exports = router;
