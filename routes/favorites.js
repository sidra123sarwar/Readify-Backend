const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const favoritesController = require('../controllers/favoritesControllers');

// Get all favorites
router.get('/', auth, favoritesController.getFavorites);

// Add/remove favorite
router.post('/', auth, favoritesController.toggleFavorite);

// Check if book is favorite
router.get('/:bookId', auth, favoritesController.isFavorite);

module.exports = router;
