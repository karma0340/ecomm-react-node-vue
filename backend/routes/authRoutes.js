const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { body, validationResult } = require('express-validator');

// Middleware for validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

// POST /auth/signup
router.post(
  '/signup',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  validate,
  authController.signup
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('username').optional().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  authController.login
);

// --- PASSWORD RESET ROUTES ---

// POST /auth/forgot-password
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  authController.forgotPassword
);

// GET /auth/reset-password/:token
router.get('/reset-password/:token', authController.verifyResetToken);

// POST /auth/reset-password/:token
router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  authController.resetPassword
);

module.exports = router;
