const express = require('express');
const router = express.Router();
const db = require('../models');
const authJwt = require('../middleware/authJwt');
const isAdmin = require('../middleware/isAdmin');

router.get('/admin/users', authJwt, isAdmin, async (req, res) => {
  try {
    const users = await db.User.findAll({ raw: true });
    res.render('users', {
      layout: 'main',
      title: 'User Management',
      user: req.user,
      users
    });
  } catch (err) {
    console.error('Error rendering users page:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});

module.exports = router;
