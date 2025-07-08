const express = require('express');
const router = express.Router();
const db = require('../../models');
const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');

// GET /users - Render user management page with users from database
router.get('/', authJwt, isAdmin, async (req, res) => {
  try {
    const users = await db.User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.render('users', {
      layout: 'main',
      title: 'Users Management',
      user: req.user,
      users: users.map(u => u.get({ plain: true }))
    });
  } catch (err) {
    console.error('Error rendering users:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});

// POST /users/add - Add new user to database
router.post('/add', authJwt, isAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    await db.User.create({ name, email, role });
    res.redirect('/users');
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});

// POST /users/:id/update - Update user in database
router.post('/:id/update', authJwt, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).render('404', { layout: 'main', title: 'Not Found', user: req.user });
    }
    await user.update({ name, email, role });
    res.redirect('/users');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});

// POST /users/:id/delete - Delete user from database
router.post('/:id/delete', authJwt, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).render('404', { layout: 'main', title: 'Not Found', user: req.user });
    }
    await user.destroy();
    res.redirect('/users');
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});

module.exports = router;
