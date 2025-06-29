const { Favourite } = require('../models');

class FavouriteService {
  async getAllFavourites() {
    try {
      return await Favourite.findAll();
    } catch (err) {
      throw err;
    }
  }
  async getFavouriteById(id) {
    try {
      const favourite = await Favourite.findByPk(id);
      if (!favourite) throw new Error('Favourite not found');
      return favourite;
    } catch (err) {
      throw err;
    }
  }
  async createFavourite(data) {
    try {
      return await Favourite.create(data);
    } catch (err) {
      throw err;
    }
  }
  async updateFavourite(id, data) {
    try {
      const favourite = await Favourite.findByPk(id);
      if (!favourite) throw new Error('Favourite not found');
      return await favourite.update(data);
    } catch (err) {
      throw err;
    }
  }
  async deleteFavourite(id) {
    try {
      const favourite = await Favourite.findByPk(id);
      if (!favourite) throw new Error('Favourite not found');
      await favourite.destroy();
      return { message: 'Favourite deleted' };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new FavouriteService();
