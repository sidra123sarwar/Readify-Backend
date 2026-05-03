const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cartController = require('../controllers/cartControllers');

// Get cart items
router.get('/', auth, cartController.getCart);

// Add/update cart item
router.post('/', auth, cartController.updateCart);

// Clear cart
router.delete('/', auth, cartController.clearCart);

// Remove specific book from cart
router.delete('/:bookId', auth, cartController.removeFromCart);

module.exports = router;
