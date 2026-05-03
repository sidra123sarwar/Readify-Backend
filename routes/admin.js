const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const Book = require('../models/Book');
const multer = require('multer');
const path = require('path');

// Configure multer for book images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Auth routes
router.post('/login', adminController.login);
router.get('/profile', adminAuth, adminController.getProfile);
router.put('/profile', adminAuth, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const admin = await require('../models/Admin').findById(req.admin._id);
    if (username) admin.username = username;
    if (email) admin.email = email;
    if (password) admin.password = password;
    await admin.save();
    res.json({ message: 'Profile updated', admin: { id: admin._id, username: admin.username, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Dashboard
router.get('/dashboard/stats', adminAuth, adminController.getDashboardStats);

// Customer management
router.get('/customers', adminAuth, adminController.getAllCustomers);
router.delete('/customers/:id', adminAuth, adminController.deleteCustomer);

// Book management
router.get('/books', adminAuth, async (req, res) => {
  try {
    const books = await Book.find().sort({ _id: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/books', adminAuth, upload.single('image'), async (req, res) => {
  try {
    console.log('Book creation request body:', req.body);
    console.log('Uploaded file:', req.file);
    
    const { title, price, category, genre, description, isBestseller, author } = req.body;
    
    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required' });
    }
    
    const bookData = {
      title,
      price: parseFloat(price),
      category: category || 'Uncategorized',
      genre: genre || 'uncategorized',
      description: description || '',
      author: author || 'Unknown Author',
      isBestseller: isBestseller === 'true' || isBestseller === true
    };

    if (req.file) {
      bookData.imagePath = `/uploads/${req.file.filename}`;
      bookData.image = `/uploads/${req.file.filename}`;
    }

    console.log('Creating book with data:', bookData);
    const book = new Book(bookData);
    await book.save();
    
    console.log('Book created successfully:', book);
    res.status(201).json(book);
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/books/:id', adminAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, price, category, genre, description, isBestseller, author } = req.body;
    
    const updateData = {
      title,
      price: parseFloat(price),
      category: category || 'Uncategorized',
      genre: genre || 'uncategorized',
      description: description || '',
      author: author || 'Unknown Author',
      isBestseller: isBestseller === 'true' || isBestseller === true
    };

    if (req.file) {
      updateData.imagePath = `/uploads/${req.file.filename}`;
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/books/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


// Order management
const Order = require('../models/Order');

router.get('/orders', adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/orders/:id/status', adminAuth, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    
    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
