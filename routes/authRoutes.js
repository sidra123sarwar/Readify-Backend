// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

// Protected routes
router.get('/verify', auth, userController.validateToken);
router.get('/me', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateUserProfile);

module.exports = router;
