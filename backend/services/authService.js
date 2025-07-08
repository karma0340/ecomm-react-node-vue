const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || require('../config/authConfig').secret;

class AuthService {
  // Signup: username, email, password are required
  async signup({ username, email, password }) {
    if (!username || !email || !password) {
      throw new Error('All fields are required');
    }

    // Check if username already exists
    const userExists = await User.findOne({ where: { username } });
    if (userExists) throw new Error('Username already exists');

    // Check if email already exists
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) throw new Error('Email already exists');

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return { user, token };
  }

  // Login: username/email and password are required
  async login({ email, username, password }) {
    if ((!username && !email) || !password) {
      throw new Error('Email or username and password are required');
    }

    // Find user by email or username
    let user = null;
    if (email) {
      user = await User.findOne({ where: { email } });
    }
    if (!user && username) {
      user = await User.findOne({ where: { username } });
    }
    if (!user) throw new Error('Invalid credentials');

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return { user, token };
  }

  // Generate password reset token and set expiration
  async generatePasswordReset(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) return null;

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    return { user, token };
  }

  // Verify password reset token
  async verifyPasswordResetToken(token) {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      }
    });
    return user;
  }

  // Reset password using token
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      }
    });
    if (!user) throw new Error('Invalid or expired password reset token.');

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return user;
  }
}

module.exports = new AuthService();
