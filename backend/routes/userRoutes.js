const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authJwt'); // Adjust path if needed
const { body, validationResult } = require('express-validator');

// Middleware for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// =======================
// Admin/Public Endpoints
// =======================

// Get all users
router.get('/', userController.getAllUsers);
// Get current user's profile
router.get('/me', verifyToken, userController.getMe);
// Get user by ID
router.get('/:id', userController.getUser);

// Create a new user
router.post(
  '/',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  userController.createUser
);

// Update user by ID
router.put(
  '/:id',
  [
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Must be a valid email')
  ],
  validate,
  userController.updateUser
);

// Delete user by ID
router.delete('/:id', userController.deleteUser);

// =======================
// Authenticated User Endpoints
// =======================



// Update current user's profile
router.put(
  '/me',
  verifyToken,
  [
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Must be a valid email')
  ],
  validate,
  userController.updateMe
);

// Update current user's password
router.put(
  '/me/password',
  verifyToken,
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
  ],
  validate,
  userController.updatePassword
);

// Delete current user's account
router.delete('/me', verifyToken, userController.deleteMe);

// Get current user's orders
router.get('/me/orders', verifyToken, userController.getMyOrders);

module.exports = router;
