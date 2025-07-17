// backend/admin/routes/userAdminRoutes.js

const express = require('express');
const router = express.Router();

// === Controllers & Middleware ===
const userController = require('../controllers/userAdminController');
const getUpload = require('../../middleware/upload');
const upload = getUpload('users'); // Store uploads in /uploads/users

const authJwt = require('../../middleware/authJwt');
const isAdmin = require('../../middleware/isAdmin');

// === Middleware Stack ===
// Use both authJwt + isAdmin for all admin routes
const adminAuth = [authJwt, isAdmin];

// === Routes for /users ===

// 📄 1. Render SSR + Vue hydrated "Manage Users" panel
router.get('/', ...adminAuth, userController.listUsers);

// ✅ 2. API: Return Users JSON for frontend fetch
router.get('/list/json', ...adminAuth, userController.getUsersJson); // 🔥 NEW route

// ✅ 3. API Create (used by Vue via Axios) - with avatar upload
router.post('/', ...adminAuth, upload.single('avatar'), userController.createUser);

// ✏️ 4. API Update - with optional avatar update
router.put('/:id', ...adminAuth, upload.single('avatar'), userController.updateUser);

// ❌ 5. API Delete
router.delete('/:id', ...adminAuth, userController.deleteUser);

// === Export router ===
module.exports = router;
