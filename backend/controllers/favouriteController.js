const favouriteService = require('../services/favouriteService');

exports.getAllFavourites = async (req, res) => {
  try {
    const favourites = await favouriteService.getAllFavourites();
    res.json(favourites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFavourite = async (req, res) => {
  try {
    const favourite = await favouriteService.getFavouriteById(req.params.id);
    res.json(favourite);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.createFavourite = async (req, res) => {
  try {
    const favourite = await favouriteService.createFavourite(req.body);
    res.status(201).json(favourite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateFavourite = async (req, res) => {
  try {
    const favourite = await favouriteService.updateFavourite(req.params.id, req.body);
    res.json(favourite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFavourite = async (req, res) => {
  try {
    const result = await favouriteService.deleteFavourite(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
