// backend/admin/controllers/userAdminController.js

const db = require('../../models');
const fs = require('fs');
const path = require('path');

let vueScriptFilename = '/dist/vue-users.js';
const manifestPath = path.join(__dirname, '../../dist/manifest.json');
try {
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const manifestKey = Object.keys(manifest).find(k =>
      k.endsWith('vue-users.js') || k.endsWith('src/vue-users.js')
    );
    if (manifestKey && manifest[manifestKey]?.file) {
      vueScriptFilename = '/dist/' + manifest[manifestKey].file;
    } else {
      console.warn('⚠️ vue-users.js not found in manifest.json.');
    }
  }
} catch (err) {
  console.warn('⚠️ Failed to load Vite manifest for vue-users:', err.message);
}

const ROLES = ['admin', 'user'];

// ========== RENDER SSR USERS PANEL ==========
exports.listUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      order: [['createdAt', 'DESC']],
      raw: true
    });

    res.render('users', {
      layout: 'main',
      title: 'Manage Users',
      user: req.user,
      vueScript: vueScriptFilename,
      initialUsers: JSON.stringify(users),
      roles: JSON.stringify(ROLES)
    });
  } catch (err) {
    console.error('❌ Error rendering users page:', err);
    res.status(500).render('500', {
      layout: 'main',
      title: 'Server Error',
      user: req.user
    });
  }
};

// ========== GET ALL USERS (JSON API) ==========
exports.getUsersJson = async (req, res) => {
  try {
    const users = await db.User.findAll({
      order: [['createdAt', 'DESC']],
      raw: true
    });
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users JSON:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ========== CREATE USER ==========
exports.createUser = async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields (name, username, email, password, role) are required.' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }
    const avatar = req.file ? `/uploads/users/${req.file.filename}` : null;
    // You may wish to hash the password here if not handled by model hooks

    const newUser = await db.User.create({ name, username, email, password, role, avatar });
    res.status(201).json(newUser);
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
};

// ========== UPDATE USER ==========
exports.updateUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, username, email, password, role } = req.body;
    if (!name || !username || !email || !role) {
      return res.status(400).json({ error: 'Name, username, email, and role are required.' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const avatar = req.file ? `/uploads/users/${req.file.filename}` : user.avatar;

    // Only update password if provided (non-empty string)
    const updateData = { name, username, email, role, avatar };
    if (password && password.trim()) updateData.password = password;

    await user.update(updateData);
    res.json(user);
  } catch (err) {
    console.error('❌ Error updating user:', err);
    res.status(500).json({ error: err.message || 'Failed to update user' });
  }
};

// ========== DELETE USER ==========
exports.deleteUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.sendStatus(204);
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
};
