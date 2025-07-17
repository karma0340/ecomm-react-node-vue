const productService = require('../services/productService');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Product } = require('../models');

// PAGINATED + FILTERED LIST
exports.getAllProducts = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const subcategoryId = req.query.subcategoryId;

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

// GET SINGLE PRODUCT
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

// CREATE PRODUCT(S) -- supports bulk and single, with images or URLs (fully defensive!)
exports.createProduct = async (req, res) => {
  try {
    let rawProducts = req.body.products;
    let products = [];

    // Support FormData (flat fields) & JSON (array or single object)
    if (rawProducts) {
      if (typeof rawProducts === 'string') {
        try {
          const parsed = JSON.parse(rawProducts);
          products = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          products = []; // Bad parse? fallback will fail in validation below
        }
      } else if (Array.isArray(rawProducts)) {
        products = rawProducts;
      } else {
        products = [rawProducts];
      }
    } else {
      // No 'products' field at all: treat all fields in body as one product
      products = [{ ...req.body }];
    }

    // If FormData, array fields may come as stringified objects
    products = products.map(p => (typeof p === 'string' ? JSON.parse(p) : p));

    const files = req.files || [];

    products.forEach((product, idx) => {
      if (files[idx]) {
        product.imageUrl = `/images/products/${files[idx].filename}`;
      }
    });

    // Validate and cast numeric fields defensively, including stock
    for (const product of products) {
      if (
        !product ||
        !product.name ||
        !product.price ||
        !product.categoryId ||
        !product.subCategoryId
      ) {
        return res.status(400).json({ error: 'Missing required fields in one or more products' });
      }
      product.price = Number(product.price);
      // Ensure stock exists and is numeric, default 0 if blank/non-numeric
      product.stock = product.stock !== undefined && product.stock !== null && product.stock !== ''
        ? Number(product.stock)
        : 0;
    }

    const createdProducts = await Product.bulkCreate(products);
    res.status(201).json(createdProducts);
  } catch (err) {
    console.error('Error in createProduct:', err);
    res.status(400).json({ error: err.message || 'Failed to create products' });
  }
};

// UPDATE A PRODUCT (with options for file or remote image)
exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, categoryId, subCategoryId, stock } = req.body;
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    let newImageUrl = product.imageUrl;

    if (req.file && req.file.filename) {
      newImageUrl = `/images/products/${req.file.filename}`;
    } else if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
      // Download remote image to local
      const fileExt = path.extname(imageUrl.split('?')[0]) || '.jpg';
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
      price: price !== undefined ? Number(price) : product.price,
      imageUrl: newImageUrl,
      categoryId: categoryId ?? product.categoryId,
      subCategoryId: subCategoryId ?? product.subCategoryId,
      // Ensure stock gets updated if provided, otherwise remains as-is
      stock: stock !== undefined && stock !== null && stock !== ''
        ? Number(stock)
        : product.stock
    });

    res.json(product);
  } catch (err) {
    console.error('Error in updateProduct:', err);
    res.status(400).json({ error: err.message || 'Failed to update product' });
  }
};

// DELETE PRODUCT
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
