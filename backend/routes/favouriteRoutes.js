const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');

router.get('/', favouriteController.getAllFavourites);
router.get('/:id', favouriteController.getFavourite);
router.post('/', favouriteController.createFavourite);
router.put('/:id', favouriteController.updateFavourite);
router.delete('/:id', favouriteController.deleteFavourite);

module.exports = router;
