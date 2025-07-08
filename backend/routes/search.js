const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('./models'); // adjust path as needed

app.get('/search', async (req, res) => {
  const q = req.query.q ? req.query.q.trim() : '';
  if (!q) {
    return res.render('searchResults', { title: 'Search', query: '', results: { users: [], products: [] } });
  }

  try {
    const [users, products] = await Promise.all([
      db.User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } }
          ]
        },
        raw: true
      }),
      db.Product.findAll({
        where: {
          name: { [Op.like]: `%${q}%` }
        },
        raw: true
      })
    ]);

    res.render('searchResults', {
      title: 'Search Results',
      query: q,
      results: { users, products }
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).render('500', { layout: 'main', title: 'Server Error', user: req.user });
  }
});