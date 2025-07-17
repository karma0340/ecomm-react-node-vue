module.exports = function (req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).render('adminLogin', {
      layout: 'main',
      title: 'Admin Login',
      isAdminLogin: true,
      error: 'You must be an authenticated admin to view this page.'
    });
  }
};
