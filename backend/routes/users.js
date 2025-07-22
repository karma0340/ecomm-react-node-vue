const express = require('express');
const router = express.Router();
const db = require('../models');
const authJwt = require('../middleware/authJwt');
const isAdmin = require('../middleware/isAdmin');
const getUpload = require('../middleware/upload');
const upload = getUpload('users');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Middleware to check logged-in user (non-admin)
function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  // For API, return json error, or redirect to login page
  return res.status(401).json({ success: false, error: 'Login required' });
}

// === Admin Users Page with Auth & Admin checks ===
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

// === SSR Wishlist page: GET /wishlist ===
router.get('/wishlist', isLoggedIn, async (req, res) => {
  try {
    // Find all wishlist entries for the user (logged-in user only)
    const wishlistItems = await db.Wishlist.findAll({
      where: { user_id: req.session.user.id },
      include: [{ model: db.Product, as: 'product' }]
    });

    res.render('wishlist', {
      layout: 'main',
      title: 'Your Wishlist',
      user: req.session.user,
      wishlist: wishlistItems || []
    });
  } catch (err) {
    console.error('Wishlist SSR Error:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.session.user });
  }
});

// === POST /profile endpoint for user profile update (including avatar upload) ===
router.post('/profile', isLoggedIn, upload.single('avatar'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateFields = { name, email };
    let avatarUrl;

    if (req.file) {
      const filepath = req.file.path; // e.g. uploads/users/timestamp-filename.ext
      const tmpOutput = filepath + '-tmp';
      try {
        await sharp(filepath)
          .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
          .toFormat('jpeg')
          .jpeg({ quality: 80 })
          .toFile(tmpOutput);

        fs.unlinkSync(filepath); // delete original large file
        fs.renameSync(tmpOutput, filepath); // replace with optimized version

        avatarUrl = `/uploads/users/${req.file.filename}`;
        updateFields.avatar = avatarUrl;

        // Update avatar in session
        req.session.user.avatar = avatarUrl;
      } catch (sharpErr) {
        console.error('[Sharp processing error]', sharpErr);
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        return res.status(500).json({ success: false, error: 'Failed to process image.' });
      }
    }

    await db.User.update(updateFields, { where: { id: req.session.user.id } });

    // Keep your session info in sync for name/email display
    req.session.user.name = name;
    req.session.user.email = email;

    res.json({ success: true, avatar: avatarUrl });
  } catch (err) {
    console.error('[Profile update error]', err);
    res.status(500).json({ success: false, error: err.message || 'Server error' });
  }
});

module.exports = router;
