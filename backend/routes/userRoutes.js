const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/authJwt');
const { body, validationResult } = require('express-validator');
const getUpload = require('../middleware/upload');
const upload = getUpload('avatars'); // stores avatars in /uploads/avatars

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// ===== Authenticated User Endpoints (PUT THESE FIRST!) =====

// Get current user's profile
router.get('/me', verifyToken, userController.getMe);

// Update current user's profile (with avatar upload!)
router.put(
  '/me',
  verifyToken,
  upload.single('avatar'),
  [
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Must be a valid email'),
    body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
  ],
  validate,
  userController.updateMe
);

// Update password for current user
router.put(
  '/me/change-password',
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

// ===== Admin/Public Endpoints (AFTER /me routes) =====

// Get all users (admin)
router.get('/', userController.getAllUsers);

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

// Update a user by ID (admin)
router.put(
  '/:id',
  [
    body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').optional().isEmail().withMessage('Must be a valid email')
  ],
  validate,
  userController.updateUser
);

// Delete a user by ID (admin)
router.delete('/:id', userController.deleteUser);

// Get a user by ID (admin/public) (THIS MUST BE LAST)
router.get('/:id', userController.getUser);

module.exports = router;
