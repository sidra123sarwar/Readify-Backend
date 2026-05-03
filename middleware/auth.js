const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[DEBUG] No token or invalid format provided');
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      console.log('[DEBUG] No token provided');
      return res.status(401).json({ message: 'No authentication token, authorization denied' });
    }

    // Verify token
    if (!process.env.JWT_SECRET) {
      console.error('[DEBUG] JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[DEBUG] Token payload:', decoded);
      
      // IMPORTANT: Check for 'id' (must match the property used in token generation)
      if (!decoded.id) {
        console.log('[DEBUG] Token invalid: No user ID in payload');
        return res.status(401).json({ message: 'Token is not valid' });
      }
      
      // Find user by id
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log(`[DEBUG] User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log(`[DEBUG] User authenticated: ${user.email}`);
      req.user = user;
      req.user.id = decoded.id; // Ensure consistent ID format
      next();
    } catch (jwtError) {
      console.error('[DEBUG] JWT verification error:', jwtError.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (error) {
    console.error('[DEBUG] Auth middleware error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = auth;   