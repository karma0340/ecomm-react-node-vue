const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

  // Login: username and password are required
  async login({ username, password }) {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Find user by username
    const user = await User.findOne({ where: { username } });
    if (!user) throw new Error('Invalid username or password');

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error('Invalid username or password');

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
  let user;
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

}

module.exports = new AuthService();
