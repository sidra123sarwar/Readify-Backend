const User = require('../models/User');

const cartController = {
  // Get cart
  getCart: async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('-password')
        .populate('cart.bookId');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user.cart);
    } catch (err) {
      console.error('Get cart error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Update cart
  updateCart: async (req, res) => {
    try {
      const { bookId, quantity } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if book is already in cart
      const cartItemIndex = user.cart.findIndex(item => 
        item.bookId.toString() === bookId
      );

      if (cartItemIndex > -1) {
        // Update quantity if already in cart
        user.cart[cartItemIndex].quantity = quantity;
      } else {
        // Add new item to cart
        user.cart.push({ bookId, quantity });
      }

      // Remove item if quantity is 0
      user.cart = user.cart.filter(item => item.quantity > 0);

      await user.save();

      const updatedUser = await User.findById(req.user.id)
        .select('-password')
        .populate('cart.bookId');

      res.json(updatedUser.cart);
    } catch (err) {
      console.error('Update cart error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Clear cart
  clearCart: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.cart = [];
      await user.save();

      res.json({ message: 'Cart cleared successfully' });
    } catch (err) {
      console.error('Clear cart error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Remove from cart
  removeFromCart: async (req, res) => {
    try {
      const { bookId } = req.params;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.cart = user.cart.filter(item => item.bookId.toString() !== bookId);
      await user.save();

      const updatedUser = await User.findById(req.user.id)
        .select('-password')
        .populate('cart.bookId');

      res.json(updatedUser.cart);
    } catch (err) {
      console.error('Remove from cart error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

module.exports = cartController;