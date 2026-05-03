const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, shippingAddress } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Check stock availability for all items
    for (const item of items) {
      if (item.bookId) {
        const book = await Book.findById(item.bookId);
        if (book) {
          if (book.stock <= 0) {
            return res.status(400).json({ 
              message: `"${book.title}" is out of stock.` 
            });
          }
          if (book.stock < item.quantity) {
            return res.status(400).json({ 
              message: `"${book.title}" only has ${book.stock} copies left in stock.` 
            });
          }
        }
      }
    }

    // Reduce stock for each item (never below 0)
    for (const item of items) {
      if (item.bookId) {
        await Book.findByIdAndUpdate(item.bookId, {
          $inc: { stock: -item.quantity }
        });
        // Ensure stock doesn't go below 0
        await Book.updateOne(
          { _id: item.bookId, stock: { $lt: 0 } },
          { $set: { stock: 0 } }
        );
      }
    }
    
    const order = new Order({
      userId: req.user.id,
      items,
      total,
      shippingAddress,
      paymentStatus: 'Pending',
      orderStatus: 'Processing'
    });
    
    await order.save();
    
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.bookId');
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    }).populate('items.bookId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
