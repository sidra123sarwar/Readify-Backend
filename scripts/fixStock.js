const mongoose = require('mongoose');
const Book = require('../models/Book');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/writers-shop').then(async () => {
  await Book.updateMany({ stock: { $lt: 0 } }, { $set: { stock: 0 } });
  console.log('Fixed all negative stocks to 0');
  mongoose.connection.close();
});
