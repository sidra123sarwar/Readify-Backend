const mongoose = require('mongoose');
const path = require('path');


const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  genre: String,
  isBestseller: { type: Boolean, default: false },
  description: String,
  author: String,
  imagePath: String,
  image: String,
  stock: { type: Number, default: 10, min: 0 }  // stock quantity
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to ensure image field is always available
BookSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure image field is set from imagePath
BookSchema.pre('save', function(next) {
  if (this.imagePath && !this.image) {
    this.image = this.imagePath;
  }
  next();
});

module.exports = mongoose.model('Book', BookSchema);
