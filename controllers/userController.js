// controllers/userController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Helper function to generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error('[DEBUG] JWT_SECRET environment variable is not defined!');
    throw new Error('JWT_SECRET is not defined');
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' // Token expires in 7 days
  });
};

// Check MongoDB connection status
const checkDbConnection = async () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  console.log(`[DEBUG] MongoDB connection status: ${states[state] || 'unknown'}`);
  return state === 1; // 1 means connected
};

const userController = {
  // ========================
  // Register new user
  // ========================
  registerUser: async (req, res) => {
    try {
      const isConnected = await checkDbConnection();
      if (!isConnected) {
        console.error('[DEBUG] MongoDB is not connected when trying to register user');
        return res.status(500).json({ message: 'Database connection issue' });
      }

      console.log('[DEBUG] Registration attempt with data:', {
        name: req.body.name,
        email: req.body.email,
        passwordLength: req.body.password ? req.body.password.length : 0
      });

      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        console.log('[DEBUG] Missing required fields:', { name: !name, email: !email, password: !password });
        return res.status(400).json({ message: 'Please enter all fields' });
      }

      if (!validator.isEmail(email)) {
        console.log('[DEBUG] Invalid email format:', email);
        return res.status(400).json({ message: 'Invalid email format' });
      }

      if (password.length < 6) {
        console.log('[DEBUG] Password too short');
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      const normalizedEmail = validator.normalizeEmail(email);
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        console.log('[DEBUG] User already exists with this email');
        return res.status(409).json({ message: 'User already exists with this email' });
      }

      const newUser = new User({
        name: validator.escape(name),
        email: normalizedEmail,
        password,
        cart: [],
        favorites: []
      });

      await newUser.save();

      const token = generateToken(newUser._id);

      res.status(201).json({
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
        token
      });
    } catch (err) {
      console.error('[DEBUG] Registration error:', err);
      res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
  },

  // ========================
  // Login user
  // ========================
  loginUser: async (req, res) => {
    try {
      const isConnected = await checkDbConnection();
      if (!isConnected) return res.status(500).json({ message: 'Database connection issue' });

      console.log('[DEBUG] Login attempt for email:', req.body.email);

      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

      const normalizedEmail = validator.normalizeEmail(email);
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = generateToken(user._id);
      res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
    } catch (err) {
      console.error('[DEBUG] Login error:', err);
      res.status(500).json({ message: 'Server error during login' });
    }
  },

  // ========================
  // Validate token
  // ========================
  validateToken: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json({ user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      console.error('[DEBUG] Token validation error:', err);
      res.status(500).json({ message: 'Server error during token validation' });
    }
  },

  // ========================
  // Get user profile
  // ========================
  getUserProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('-password')
        .populate('cart.bookId')
        .populate('favorites');
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error('[DEBUG] Get profile error:', err);
      res.status(500).json({ message: 'Server error while fetching profile' });
    }
  },

  // ========================
  // Update user profile
  // ========================
  updateUserProfile: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = validator.escape(name);
      if (email) {
        if (!validator.isEmail(email)) return res.status(400).json({ message: 'Invalid email format' });
        user.email = validator.normalizeEmail(email);
      }
      if (password) {
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
        user.password = password;
      }

      await user.save();
      res.json({ id: user._id, name: user.name, email: user.email });
    } catch (err) {
      console.error('[DEBUG] Update profile error:', err);
      res.status(500).json({ message: 'Server error while updating profile' });
    }
  },

  // ========================
  // Forgot Password
  // ========================
  forgotPassword: async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 3600000;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Try to send email if configured
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
            process.env.EMAIL_USER !== 'your_gmail@gmail.com') {
          try {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
              }
            });
            await transporter.sendMail({
              from: `"Readify" <${process.env.EMAIL_USER}>`,
              to: user.email,
              subject: "Password Reset - Readify",
              html: `<p>Click to reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>Expires in 1 hour.</p>`
            });
          } catch (emailErr) {
            console.error('Email send failed:', emailErr.message);
          }
        }

        // Always return the reset link in dev mode
        return res.status(200).json({
          message: `Password reset link generated.`,
          resetUrl: resetUrl  // Frontend can show this directly
        });
      }

      res.status(200).json({
        message: `If an account exists for ${email}, you will receive password reset instructions.`
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      res.status(500).json({ message: "Server error" });
    }
  },

  // ========================
  // Reset Password
  // ========================
  resetPassword: async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() }
      });

      if (!user) return res.status(400).json({ message: "Invalid or expired token" });

      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.json({ message: "Password reset successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
};

module.exports = userController;
