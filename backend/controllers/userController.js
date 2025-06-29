const userService = require('../services/userService');

// Admin/public endpoints
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: err.message || 'User not found' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
};

// Authenticated user endpoints

exports.getMe = async (req, res) => {
  try {
    // Debug: log the user info attached by the middleware
    console.log('req.user:', req.user);

    if (!req.user || !req.user.id) {
      console.error('getMe: req.user or req.user.id is missing');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await userService.getUserById(req.user.id);

    // Debug: log the result from the service
    console.log('getMe: userService.getUserById result:', user);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('getMe error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch user' });
  }
};

exports.updateMe = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.user.id, req.body);
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update profile' });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    await userService.updatePassword(req.user.id, req.body.oldPassword, req.body.newPassword);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update password' });
  }
};

exports.deleteMe = async (req, res) => {
  try {
    await userService.deleteUser(req.user.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to delete user' });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await userService.getUserOrders(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to get orders' });
  }
};
