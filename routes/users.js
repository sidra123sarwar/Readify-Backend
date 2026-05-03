// const express = require('express');
// const router = express.Router();
// const auth = require('../middleware/auth');
// const userController = require('../controllers/userController');

// // Profile & Info
// router.get('/me', auth, userController.getUserProfile);
// router.put('/profile', auth, userController.updateUserProfile);

// // Cart
// router.get('/cart', auth, userController.getCart);
// router.post('/cart', auth, userController.updateCart);
// router.delete('/cart', auth, userController.clearCart);
// router.delete('/cart/:bookId', auth, userController.removeFromCart);

// // Favorites
// router.get('/favorites', auth, userController.getFavorites);
// router.post('/favorites', auth, userController.toggleFavorite);
// router.get('/favorites/:bookId', auth, userController.isFavorite);

// module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, userController.getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateUserProfile);

// @route   GET /api/users/validate
// @desc    Validate user token
// @access  Private
router.get('/validate', auth, userController.validateToken);

// Export router
module.exports = router;