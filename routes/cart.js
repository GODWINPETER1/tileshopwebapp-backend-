const express = require('express');

const router = express.Router();

const cartController = require('../controllers/cartController');
const cartSession = require('../middleware/cartSession');

// Get existing cart or create a new guest cart
router.get('/', cartSession, cartController.getCart);
router.post('/items', cartSession , cartController.addToCart);
router.put('/items/:itemId', cartSession , cartController.updateCartItem);
router.delete('/items/:itemId', cartSession , cartController.removeCartItem);
router.delete('/', cartSession , cartController.clearCart);

module.exports = router;