const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');
const upload = require('../middleware/upload');

// Create variant (image)
router.post('/', upload.single('image'), variantController.createVariant);

// Get variants for a product
router.get('/product/:productId', variantController.getVariantsByProduct);

// Get single variant
router.get('/:id', variantController.getVariantById);

// Update variant
router.put('/:id', upload.single('image'), variantController.updateVariant);

// Delete variant
router.delete('/:id', variantController.deleteVariant);

module.exports = router;
