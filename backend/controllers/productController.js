const productService = require('../services/productService');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Product } = require('../models');

// Get all products (paginated)
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const subcategoryId = req.query.subcategoryId;

    // productService must return { rows, count }
    const { rows, count } = await productService.getAllProducts({ offset, limit, subcategoryId });

    res.json({
      products: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (err) {
    console.error('Error in getAllProducts:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
};

// Get a single product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Error in getProduct:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch product' });
  }
};

// Bulk create products with multiple images
exports.createProduct = async (req, res) => {
  try {
    let products = req.body.products;
    if (!Array.isArray(products)) products = [products];
    products = products.map(p => typeof p === 'string' ? JSON.parse(p) : p);

    for (const product of products) {
      if (!product.name || !product.price || !product.categoryId || !product.subCategoryId) {
        return res.status(400).json({ error: 'Missing required fields in one or more products' });
      }
    }

    const files = req.files || [];
    products.forEach((product, idx) => {
      if (files[idx]) {
        product.imageUrl = `/images/products/${files[idx].filename}`;
      }
    });

    const createdProducts = await Product.bulkCreate(products);
    res.status(201).json(createdProducts);
  } catch (err) {
    console.error('Error in createProduct:', err);
    res.status(400).json({ error: err.message || 'Failed to create products' });
  }
};

// Update a product (with file upload or remote image URL)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, categoryId, subCategoryId } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let newImageUrl = product.imageUrl;

    if (req.file) {
      newImageUrl = `/images/products/${req.file.filename}`;
    } else if (imageUrl && imageUrl.startsWith('http')) {
      // Download remote image
      const fileExt = path.extname(imageUrl).split('?')[0] || '.jpg';
      const filename = `${Date.now()}${fileExt}`;
      const localPath = path.join(__dirname, '../public/images/products', filename);

      const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream'
      });

      await new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(localPath))
          .on('error', reject)
          .once('close', resolve);
      });

      newImageUrl = `/images/products/${filename}`;
    } else if (imageUrl) {
      newImageUrl = imageUrl;
    }

    await product.update({
      name: name ?? product.name,
      description: description ?? product.description,
      price: price ?? product.price,
      imageUrl: newImageUrl,
      categoryId: categoryId ?? product.categoryId,
      subCategoryId: subCategoryId ?? product.subCategoryId
    });

    res.json(product);
  } catch (err) {
    console.error('Error in updateProduct:', err);
    res.status(400).json({ error: err.message || 'Failed to update product' });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error in deleteProduct:', err);
    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
};
