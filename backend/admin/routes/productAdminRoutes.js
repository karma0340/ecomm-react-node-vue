const express = require('express');
const router = express.Router();

const getUpload = require('../../middleware/upload');
const upload = getUpload('products');
const productAdminController = require('../controllers/productAdminController');

// SSR Admin Product Page
router.get('/', productAdminController.listProducts);

// API for Vue Admin
router.get('/api', productAdminController.apiListProducts);
router.post('/api', upload.single('image'), productAdminController.apiAddProduct);
router.put('/api/:id', upload.single('image'), productAdminController.apiEditProduct);
router.delete('/api/:id', productAdminController.apiDeleteProduct);

module.exports = router;
