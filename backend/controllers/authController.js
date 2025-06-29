const authService = require('../services/authService');

exports.signup = async (req, res) => {
  try {
    const { user, token } = await authService.signup(req.body);
    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: user.id, username: user.username, email: user.email },
      accessToken: token
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({
      message: 'Login successful!',
      user: { id: user.id, username: user.username, email: user.email },
      accessToken: token
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};
