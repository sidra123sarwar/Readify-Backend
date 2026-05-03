const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/writers-shop');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@readify.com' });
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin({
      username: 'admin',
      email: 'admin@readify.com',
      password: 'admin123',
      role: 'admin'
    });

    await admin.save();
    console.log('Admin created successfully!');
    console.log('Email: admin@readify.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
