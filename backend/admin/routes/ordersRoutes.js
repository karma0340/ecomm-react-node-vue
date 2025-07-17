const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../../models');
const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');

const manifestPath = path.join(__dirname, '../../dist/manifest.json');

// ✅ GET /admin/orders - Render SSR with Orders
router.get('/', authJwt, isAdmin, async (req, res) => {
  try {
    // Load Vite manifest.json to get the correct Vue file
    let manifest = {};
    if (fs.existsSync(manifestPath)) {
      try {
        const raw = fs.readFileSync(manifestPath, 'utf-8');
        manifest = JSON.parse(raw);
      } catch (err) {
        console.error('❌ Error parsing manifest.json:', err.message);
      }
    } else {
      console.warn('⚠️ manifest.json not found at:', manifestPath);
    }

    // Find the compiled Vue JS file (e.g., src/vue-orders.js)
    const vueFile =
      manifest['src/vue-orders.js']?.file ||
      manifest['./src/vue-orders.js']?.file;

    if (!vueFile) {
      console.warn('⚠️ Vue file entry not found in manifest.json');
    }

    // Fetch all orders with user and product details
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: db.OrderItem,
          as: 'items',
          include: [
            {
              model: db.Product,
              as: 'product',
              attributes: ['id', 'name', 'price', 'imageUrl'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const plainOrders = orders.map(order => order.get({ plain: true }));

    res.render('orders', {
      layout: 'main',
      title: 'Orders',
      user: req.user || null,
      orders: plainOrders,
      vueScript: vueFile ? `/dist/${vueFile}` : null,
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error.message, error.stack);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user || null,
    });
  }
});

// ✅ POST /admin/orders/:id/delete - Delete an order
router.post('/:id/delete', authJwt, isAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const order = await db.Order.findByPk(id);

    if (!order) {
      return res.status(404).render('404', {
        layout: 'main',
        title: 'Order Not Found',
        user: req.user || null,
      });
    }

    await order.destroy(); // soft delete alternative: .update({ status: 'cancelled' })
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('❌ Error deleting order:', error.message, error.stack);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user || null,
    });
  }
});

module.exports = router;
