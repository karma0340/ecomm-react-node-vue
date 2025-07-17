const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../../models'); // Import db to access UserLogin and User
const { User } = db; // Use User from db

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

  // Accept login, username, or email as the login field
  const login = req.body.login || req.body.username || req.body.email;
  const password = req.body.password;

  if (!login || !password) {
    console.log('Missing login or password');
    return res.status(400).render('adminLogin', {
      layout: 'main',
      title: 'Admin Login',
      isAdminLogin: true,
      error: 'Email/Username and password are required.'
    });
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
  try {
    // Find user by email or username
    const user = await User.findOne({
      where: isEmail ? { email: login } : { username: login }
    });

    console.log('User found:', user ? user.username : 'No user');

    if (!user) {
      return res.status(401).render('adminLogin', {
        layout: 'main',
        title: 'Admin Login',
        isAdminLogin: true,
        error: 'Invalid credentials.'
      });
    }

    // Compare entered password with stored hashed password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      return res.status(401).render('adminLogin', {
        layout: 'main',
        title: 'Admin Login',
        isAdminLogin: true,
        error: 'Invalid credentials.'
      });
    }

    console.log('User role:', user.role);

    if (user.role !== 'admin') {
      return res.status(403).render('adminLogin', {
        layout: 'main',
        title: 'Admin Login',
        isAdminLogin: true,
        error: 'Access denied. Admins only.'
      });
    }

    // Success: set session
    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    // ✅ Log the admin login for daily insights!
    try {
      await db.UserLogin.create({ userId: user.id });
    } catch (e) {
      console.error('Failed to log admin login:', e);
      // Do not block login if logging fails
    }

    console.log('Admin login successful:', user.username);
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
