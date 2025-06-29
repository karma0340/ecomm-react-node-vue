const express = require('express');
const router = express.Router();
const subcategoryController = require('../controllers/subcategoryController');

router.get('/', subcategoryController.getAllSubCategories);
router.get('/:id', subcategoryController.getSubCategory);
router.post('/', subcategoryController.createSubCategory);
router.put('/:id', subcategoryController.updateSubCategory);
router.delete('/:id', subcategoryController.deleteSubCategory);

module.exports = router;
