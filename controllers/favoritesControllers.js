const User = require('../models/User');

const favoritesController = {
  // Get favorites
  getFavorites: async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('-password')
        .populate('favorites');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user.favorites);
    } catch (err) {
      console.error('Get favorites error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Toggle favorite
  toggleFavorite: async (req, res) => {
    try {
      const { bookId } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if book is already in favorites
      const favIndex = user.favorites.findIndex(id => 
        id.toString() === bookId
      );

      if (favIndex > -1) {
        // Remove from favorites
        user.favorites.splice(favIndex, 1);
      } else {
        // Add to favorites
        user.favorites.push(bookId);
      }

      await user.save();

      const updatedUser = await User.findById(req.user.id)
        .select('-password')
        .populate('favorites');

      res.json(updatedUser.favorites);
    } catch (err) {
      console.error('Toggle favorite error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Check if book is favorite
  isFavorite: async (req, res) => {
    try {
      const { bookId } = req.params;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isFav = user.favorites.some(id => id.toString() === bookId);
      res.json({ isFavorite: isFav });
    } catch (err) {
      console.error('Check favorite error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = favoritesController;