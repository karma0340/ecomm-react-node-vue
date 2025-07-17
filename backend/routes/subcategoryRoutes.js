const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');
const getUpload = require('../middleware/upload');
const upload = getUpload('subcategories'); // folder: uploads/subcategories

// -------- Public / API Routes --------

// 👇 Get all subcategories (optionally filtered by categoryId)
router.get('/', subcategoryController.getAllSubCategories);

// 👇 Get a single subcategory
router.get('/:id', subcategoryController.getSubCategory);

// 👇 Create a subcategory - supports file upload or image URL
router.post(
  '/',
  upload.single('image'), // field name: 'image'
  subcategoryController.createSubCategory
);

// 👇 Update a subcategory (same support for file or URL)
router.put(
  '/:id',
  upload.single('image'),
  subcategoryController.updateSubCategory
);

// 👇 Delete a subcategory
router.delete('/:id', subcategoryController.deleteSubCategory);

module.exports = router;
