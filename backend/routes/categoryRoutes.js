const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const getUpload = require('../middleware/upload');

// Use the upload middleware for the 'categories' folder
const uploadCategory = getUpload('categories');

// Routes
router.get('/', categoryController.getAllCategories); // GET all categories (with pagination)
router.get('/:id', categoryController.getCategory);   // GET single category by ID

router.post('/', uploadCategory.single('image'), categoryController.createCategory); // CREATE with image
router.put('/:id', uploadCategory.single('image'), categoryController.updateCategory); // UPDATE with image

router.delete('/:id', categoryController.deleteCategory); // DELETE

module.exports = router;
