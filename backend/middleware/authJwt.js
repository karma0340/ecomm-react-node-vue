
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const JWT_SECRET = process.env.JWT_SECRET || require('../config/authConfig').secret;

const verifyToken = async (req, res, next) => {
  try {
    // 1. Get the Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided!' });
    }

    // 2. Accept "Bearer <token>" or just "<token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    if (!token) {
      return res.status(401).json({ message: 'Malformed token!' });
    }

    // 3. Verify the token
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

    // 4. Fetch user from DB (only non-deleted if paranoid: true)
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'name', 'role']
    });

    if (!user) {
      // Debug log for troubleshooting
      console.log(`Auth middleware: User with id ${decoded.id} not found in DB.`);
      return res.status(404).json({ message: 'User not found!' });
    }

    // 5. Attach user info to req.user
    req.user = user.get({ plain: true });

    // Debug log for troubleshooting
    // console.log('Authenticated user:', req.user);

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Authentication failed!', error: err.message });
  }
};

module.exports = verifyToken;
