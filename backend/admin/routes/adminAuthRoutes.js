// admin/routes/adminAuthRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../../models');
const bcrypt = require('bcrypt');

// GET: Admin Login Page
router.get('/login', (req, res) => {
  res.render('adminLogin', { layout: 'main', title: 'Admin Login', hideHeader: true });
});

// POST: Handle Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.User.findOne({ where: { email, role: 'admin' } });

    if (!user) {
      return res.render('adminLogin', { layout: 'main', error: 'Invalid credentials', hideHeader: true });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('adminLogin', { layout: 'main', error: 'Invalid credentials', hideHeader: true });
    }

    req.session.userId = user.id;
    req.session.role = user.role;
    // Optionally, set req.user for use in templates
    req.user = { id: user.id, name: user.name, email: user.email, role: user.role };

    res.redirect('/admin');
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).render('adminLogin', { layout: 'main', error: 'Server error. Please try again.', hideHeader: true });
  }
});

// GET: Admin Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
