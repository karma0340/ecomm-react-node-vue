const db = require('../../models');
const Product = db.Product;
const Category = db.Category;
const User = db.User;

exports.getSidebarData = async (req, res, next) => {
  try {
    const products = await Product.findAll({ attributes: ['id', 'name'] });
    const categories = await Category.findAll({ attributes: ['id', 'name'] });
    const users = await User.findAll({ attributes: ['id', 'name'] });

    res.locals.sidebarData = { products, categories, users };
    next();
  } catch (err) {
    next(err);
  }
};
