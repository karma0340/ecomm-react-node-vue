const fs = require('fs');
const path = require('path');
const db = require('../../models');

// ✅ GET /admin/orders – Orders Management Page
exports.listOrders = async (req, res) => {
  try {
    // 🔹 Load Vite manifest to include correct Vue file
    const manifestPath = path.join(__dirname, '../../dist/manifest.json');
    const manifest = fs.existsSync(manifestPath)
      ? JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      : {};

    const vueFile =
      manifest['src/vue-orders.js']?.file ||
      manifest['./src/vue-orders.js']?.file;

    if (!vueFile) {
      throw new Error('❌ Vue build file not found in dist/manifest.json');
    }

    // 🔹 Fetch orders with related models
    const orders = await db.Order.findAll({
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: db.OrderItem,
          as: 'items',
          include: [
            {
              model: db.Product,
              as: 'product',
              attributes: ['id', 'name', 'imageUrl', 'price']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const plainOrders = orders.map(order => order.get({ plain: true }));

    // 🔹 Render the page
    res.render('orders', {
      layout: 'main',
      title: 'Orders',
      user: req.user,
      orders: plainOrders,
      vueScript: `/dist/${vueFile}`
    });
  } catch (err) {
    console.error('❌ Error loading orders:', err.message);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
};
