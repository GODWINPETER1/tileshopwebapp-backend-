const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');


router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:category', productController.getProductsByCategory);
router.post('/', upload.single('mainImage'), productController.createProduct);
router.put('/:id', upload.single('mainImage'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
