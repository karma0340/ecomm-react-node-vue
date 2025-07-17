const { Product, Category, SubCategory } = require('../models');

class ProductService {
  // Get all products with pagination and associations
  async getAllProducts({ offset = 0, limit = 10, subcategoryId } = {}) {
    const where = {};
    if (subcategoryId) {
      where.subCategoryId = subcategoryId;
    }
    return await Product.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: SubCategory, as: 'subCategory', attributes: ['id', 'name'] }
      ]
    });
  }

  // Get a single product by ID with associations
  async getProductById(id) {
    return await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: SubCategory, as: 'subCategory', attributes: ['id', 'name'] }
      ]
    });
  }

  // Create a single product
  async createProduct(data) {
    return await Product.create(data);
  }

  // Bulk create products
  async bulkCreateProducts(products) {
    return await Product.bulkCreate(products);
  }

  // Update a product by ID
  async updateProduct(id, data) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    return await product.update(data);
  }

  // Delete a product by ID
  async deleteProduct(id) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.destroy();
    return { message: 'Product deleted' };
  }
}

module.exports = new ProductService();
