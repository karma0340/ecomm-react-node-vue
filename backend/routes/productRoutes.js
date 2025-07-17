const express = require('express');
const router = express.Router();

const getUpload = require('../middleware/upload');
const productController = require('../controllers/productController');

const uploadProduct = getUpload('products');

// List products (with optional pagination/filter via query)
router.get('/', productController.getAllProducts);

// Get a single product by ID
router.get('/:id', productController.getProduct);

// Create products (supports file array upload)
router.post('/', uploadProduct.array('image'), productController.createProduct);

// Update a product (supports single file upload)
router.put('/:id', uploadProduct.single('image'), productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
