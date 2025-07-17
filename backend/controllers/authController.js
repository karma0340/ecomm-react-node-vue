const authService = require('../services/authService');
const db = require('../models');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // You must implement this utility

/**
 * User Registration Controller
 */
exports.signup = async (req, res) => {
  try {
    const { user, token } = await authService.signup(req.body);

    // Log activity: User registered
    await db.Activity.create({
      userId: user.id,
      action: 'Registered',
      timestamp: new Date()
    });

    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: user.id, username: user.username, email: user.email },
      accessToken: token
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Registration failed.' });
  }
};

/**
 * User Login Controller
 */
exports.login = async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);

    // Log activity: User logged in
    await db.Activity.create({
      userId: user.id,
      action: 'Logged in',
      timestamp: new Date()
    });

    // ✅ Log the login event for daily insights!
    await db.UserLogin.create({ userId: user.id });

    // Set JWT as HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      message: 'Login successful!',
      user: { id: user.id, username: user.username, email: user.email },
      accessToken: token
    });
  } catch (err) {
    res.status(401).json({ message: err.message || 'Login failed.' });
  }
};

/**
 * Forgot Password Controller
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.User.findOne({ where: { email } });
    // Always respond success, even if user not found
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process password reset request.' });
  }
};

/**
 * Verify Reset Token Controller
 */
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await db.User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [db.Sequelize.Op.gt]: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }
    res.json({ message: 'Token is valid.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

/**
 * Reset Password Controller
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await db.User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [db.Sequelize.Op.gt]: new Date() }
      }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }

    user.password = password; // Hash with bcrypt if your app uses it!
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password has been reset successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password.' });
  }
};
