/* This code snippet is a middleware function in JavaScript used for verifying JSON Web Tokens (JWT) in a Node.js application. Here's a breakdown of what the code does: */
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || require('../config/authConfig').secret;

// Middleware to verify JWT from header or cookie
const verifyToken = async (req, res, next) => {
  try {
    // 1. Try to get the token from Authorization header
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    }

    // 2. If not in header, try to get token from cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 3. If still no token, reject the request
    if (!token) {
      return res.status(401).json({ message: 'No token provided!' });
    }

    // 4. Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired!' });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(403).json({ message: 'Invalid token!' });
      }
      return res.status(500).json({ message: 'Token verification failed!', error: err.message });
    }

    // 5. Fetch user from DB (only non-deleted if paranoid: true)
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'name', 'role']
    });

    if (!user) {
      console.log(`Auth middleware: User with id ${decoded.id} not found in DB.`);
      return res.status(404).json({ message: 'User not found!' });
    }

    // 6. Attach user info to req.user
    req.user = user.get({ plain: true });

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Authentication failed!', error: err.message });
  }
};

module.exports = verifyToken;
