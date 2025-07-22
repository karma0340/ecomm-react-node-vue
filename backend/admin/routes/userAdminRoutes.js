const express = require('express');
const router = express.Router();
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// === Controllers & Middleware ===
const userController = require('../controllers/userAdminController');
const getUpload = require('../../middleware/upload');
const upload = getUpload('users');

const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');
const db = require('../../models');

// Middleware stack for admin
const adminAuth = [authJwt, isAdmin];

// === User Management Routes (Admin only) ===
router.get('/', ...adminAuth, userController.listUsers);
router.get('/list/json', ...adminAuth, userController.getUsersJson);
router.post('/', ...adminAuth, upload.single('avatar'), userController.createUser);
router.put('/:id', ...adminAuth, upload.single('avatar'), userController.updateUser);
router.delete('/:id', ...adminAuth, userController.deleteUser);

// ==================
// ADMIN PROFILE & SETTINGS (at /admin/users/profile, etc)
// ==================

// GET: Admin profile page
router.get('/profile', ...adminAuth, async (req, res, next) => {
  try {
    const userInstance = await db.User.findByPk(req.user.id);
    if (!userInstance) {
      return res.status(404).render('404', { layout: 'main', title: 'User Not Found' });
    }
    const user = userInstance.get({ plain: true });
    res.render('profile', {
      layout: 'main',
      title: 'Profile',
      user
    });
  } catch (err) {
    console.error('[ADMIN PROFILE ERROR]:', err);
    next(err); // Forward to global error handler
  }
});

// GET: Admin settings page
router.get('/settings', ...adminAuth, async (req, res, next) => {
  try {
    const userInstance = await db.User.findByPk(req.user.id);
    if (!userInstance) {
      return res.status(404).render('404', { layout: 'main', title: 'User Not Found' });
    }
    const user = userInstance.get({ plain: true });
    res.render('settings', {
      layout: 'main',
      title: 'Settings',
      user
    });
  } catch (err) {
    console.error('[ADMIN SETTINGS GET ERROR]:', err);
    next(err);
  }
});

// POST: Admin settings/update (avatar upload + sharp resize, robust error handling)
router.post('/settings', ...adminAuth, upload.single('avatar'), async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updateFields = { name, email };

    if (req.file) {
      const filepath = req.file.path;
      const tmpOutput = filepath + '-tmp';

      try {
        await sharp(filepath)
          .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toFile(tmpOutput);

        fs.unlinkSync(filepath);
        fs.renameSync(tmpOutput, filepath);

        updateFields.avatar = `/uploads/users/${req.file.filename}`;
        req.session.user.avatar = updateFields.avatar;
      } catch (sharpErr) {
        console.error('[SHARP AVATAR PROCESS ERROR]:', sharpErr);
        // Clean up broken uploads
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        return next(sharpErr);
      }
    }

    await db.User.update(updateFields, { where: { id: req.user.id } });
    req.session.user.name = name;
    req.session.user.email = email;

    const userInstance = await db.User.findByPk(req.user.id);
    const user = userInstance.get({ plain: true });

    res.render('settings', {
      layout: 'main',
      title: 'Settings',
      user,
      success: 'Settings updated!'
    });
  } catch (err) {
    console.error('[ADMIN SETTINGS POST ERROR]:', err);
    // Even on error, try to load user for the page
    let user = {};
    try {
      const userInstance = await db.User.findByPk(req.user.id);
      user = userInstance ? userInstance.get({ plain: true }) : {};
    } catch(innerErr) {
      console.error('[ERROR LOADING USER AFTER FAILURE]:', innerErr);
    }
    res.render('settings', {
      layout: 'main',
      title: 'Settings',
      user,
      error: 'Failed to update settings.'
    });
  }
});

module.exports = router;
