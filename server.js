// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');

// Load env variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/writers-shop')
  .then(() => console.log(' MongoDB connected'))
  .catch(err => console.error(' MongoDB connection error:', err));

// ===== Middleware =====
app.use(cors({
  origin: process.env.FRONT_END_URL, // frontend
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Log incoming requests (debug)
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// ===== Static Files =====
// Uploads folder inside project
const uploadDir = process.env.UPLOAD_PATH || path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Serve your D:\assets folder
app.use('/assets', express.static('D:/assets'));

// ===== Multer File Upload =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ===== Import Routes =====
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/users');
const bookRoutes = require('./routes/books');
const cartRoutes = require('./routes/cart');
const favoritesRoutes = require('./routes/favorites');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// File upload endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ filePath: `/uploads/${req.file.filename}` });
});

// Python recommendation endpoint
app.post('/api/recommend', (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ message: 'Query is required' });

  const pyPath = path.join(__dirname, 'recommend.py');
  const py = spawn('python', [pyPath, query]);

  let output = '';
  let errorOutput = '';
  py.stdout.on('data', data => output += data.toString());
  py.stderr.on('data', err => errorOutput += err.toString());

  // Timeout after 60 seconds
  const timeout = setTimeout(() => {
    py.kill();
    res.status(500).json({ message: 'Recommendation service timed out. Please try again.' });
  }, 60000);

  py.on('close', (code) => {
    clearTimeout(timeout);
    if (res.headersSent) return;
    try {
      const json = JSON.parse(output);
      res.json(json);
    } catch (err) {
      console.error('Python stderr:', errorOutput);
      res.status(500).json({ message: 'Error parsing Python output', error: errorOutput || err.toString() });
    }
  });
});

// API Status Endpoint
app.get('/api', (req, res) => {
  res.json({
    status: '✅ API is working',
    endpoints: {
      auth: { register: 'POST /api/auth/register', login: 'POST /api/auth/login', validateToken: 'GET /api/auth/verify' },
      users: { profile: 'GET /api/users/profile', update: 'PUT /api/users/profile', validate: 'GET /api/users/validate' },
      books: { getAll: 'GET /api/books', getOne: 'GET /api/books/:id', create: 'POST /api/books', update: 'PATCH /api/books/:id', delete: 'DELETE /api/books/:id' },
      cart: { get: 'GET /api/cart', update: 'POST /api/cart', clear: 'DELETE /api/cart', remove: 'DELETE /api/cart/:bookId' },
      favorites: { get: 'GET /api/favorites', toggle: 'POST /api/favorites', check: 'GET /api/favorites/:bookId' },
      upload: 'POST /api/upload'
    }
  });
});

// ===== 404 Handler =====
app.use((req, res) => res.status(404).json({ message: `❌ Route ${req.originalUrl} not found` }));

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: '❌ Internal server error', error: process.env.NODE_ENV === 'development' ? err : {} });
});

// ===== Start Server =====
app.listen(PORT, () => {
  // console.log(`🚀 Server running at http://localhost:${PORT}`);
  // console.log(`📘 API docs at http://localhost:${PORT}/api`);
});
