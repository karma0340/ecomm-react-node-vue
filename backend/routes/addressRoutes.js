const express = require('express');
const router = express.Router();
const db = require('../models');
const Address = db.Address; // from your models/index.js
const authenticate = require('../middleware/authJwt');

// GET all addresses for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.findAll({ where: { user_id: userId } });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: "Could not get addresses." });
  }
});

// POST (create new address)
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    let address = await Address.create({
      ...req.body,
      user_id: userId
    });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: "Could not create address." });
  }
});

// PUT (edit/update address)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    let address = await Address.findOne({ where: { id: req.params.id, user_id: userId } });
    if (!address) return res.status(404).json({ message: "Address not found." });
    await address.update(req.body);
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: "Could not update address." });
  }
});

// DELETE address
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    let address = await Address.findOne({ where: { id: req.params.id, user_id: userId } });
    if (!address) return res.status(404).json({ message: "Address not found." });
    await address.destroy();
    res.json({ message: "Address deleted." });
  } catch (err) {
    res.status(500).json({ message: "Could not delete address." });
  }
});

// PUT set default address
router.put('/:id/default', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    let address = await Address.findOne({ where: { id: req.params.id, user_id: userId } });
    if (!address) return res.status(404).json({ message: "Address not found." });
    // First, unset "isDefault" for all
    await Address.update({ isDefault: false }, { where: { user_id: userId } });
    // Set default for this address
    await address.update({ isDefault: true });
    res.json({ message: "Default address set." });
  } catch (err) {
    res.status(500).json({ message: "Could not set default address." });
  }
});

module.exports = router;
