// File: scripts/updateImages.js
const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Book');
// Adjust path if needed

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/writers-shop');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

const updateImagePaths = async () => {
  try {
    const products = await Product.find();
    if (!products.length) return console.log('No products found.');

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const filename = `/uploads/book${i + 1}.jpeg`;

      product.image = filename;
      await product.save();
      console.log(`Updated ${product.title} with image ${filename}`);
    }

    console.log('All product images updated.');
    process.exit(0);
  } catch (err) {
    console.error('Update error:', err);
    process.exit(1);
  }
};

connectDB().then(updateImagePaths);
