// middleware/isAdmin.js
module.exports = (req, res, next) => {
  if (req.session && req.session.userId && req.session.role === 'admin') {
    return next();
  }
  res.redirect('/admin/login');
};
