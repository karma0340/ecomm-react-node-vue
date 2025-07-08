const express = require('express');
const router = express.Router();
const getUpload = require('../middleware/upload'); // <-- This is the correct import!
const productController = require('../controllers/productController');

const uploadProduct = getUpload('products');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.post('/', uploadProduct.array('image'), productController.createProduct);
router.put('/:id', uploadProduct.single('image'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
