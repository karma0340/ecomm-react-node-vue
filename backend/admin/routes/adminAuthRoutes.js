const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../models');
const { User } = db;

// GET: Admin Login Page
router.get('/login', (req, res) => {
  res.render('adminLogin', {
    layout: 'main',
    title: 'Admin Login',
    isAdminLogin: true,
    error: req.flash ? req.flash('error') : null
  });
});

// POST: Admin Login Handler
router.post('/login', async (req, res) => {
  console.log('Login attempt:', req.body);

  // Accept login as email or username (or explicit 'login' field)
  const login = req.body.login || req.body.username || req.body.email;
  const password = req.body.password;

  if (!login || !password) {
    return res.status(400).render('adminLogin', {
      layout: 'main',
      title: 'Admin Login',
      isAdminLogin: true,
      error: 'Email/Username and password are required.'
    });
  }

  // Determine if login is email or username
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);

  try {
    // Find user by email or username
    const user = await User.findOne({
      where: isEmail ? { email: login } : { username: login }
    });

    if (!user) {
      return res.status(401).render('adminLogin', {
        layout: 'main',
        title: 'Admin Login',
        isAdminLogin: true,
        error: 'Invalid credentials.'
      });
    }
    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).render('adminLogin', {
        layout: 'main',
        title: 'Admin Login',
        isAdminLogin: true,
        error: 'Invalid credentials.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).render('adminLogin', {
        layout: 'main',
        title: 'Admin Login',
        isAdminLogin: true,
        error: 'Access denied. Admins only.'
      });
    }

    // Set minimal session user object
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // Log the login (optional, non-blocking)
    try {
      if (db.UserLogin && db.UserLogin.create) {
        await db.UserLogin.create({ userId: user.id });
      }
    } catch (e) {
      console.warn('Failed to log admin login:', e.message || e);
    }

    return res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).render('adminLogin', {
      layout: 'main',
      title: 'Admin Login',
      isAdminLogin: true,
      error: 'Server error. Please try again.'
    });
  }
});

// POST: Admin Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

module.exports = router;
