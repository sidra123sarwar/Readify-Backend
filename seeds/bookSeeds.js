const mongoose = require('mongoose');
const Book = require('../models/Book');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/writers-shop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const bookSeeds = [
  {
    title: "Professional Writer's Notebook",
    price: 24.99,
    category: "stationery",
    genre: "uncategorized",
    isBestseller: true,
    image: "/api/placeholder/300/300",
    description: "Premium notebook designed for writers with acid-free paper and lay-flat binding."
  },
  {
    title: "The Art of Storytelling",
    price: 34.95,
    category: "books",
    genre: "business",
    isBestseller: false,
    image: "/api/placeholder/300/300",
    description: "Comprehensive guide to crafting compelling narratives for writers of all levels."
  },
  {
    title: "Gourmet Cooking for Writers",
    price: 45.99,
    category: "books",
    genre: "cookbook",
    isBestseller: true,
    image: "/api/placeholder/300/300",
    description: "The perfect cookbook for writers looking to cook delicious meals while staying creative."
  },
  {
    title: "The Last Chapter",
    price: 29.99,
    category: "books",
    genre: "drama",
    isBestseller: false,
    image: "/api/placeholder/300/300",
    description: "A compelling drama about a novelist facing their own mortality and final work."
  },
  {
    title: "Mystery at the Writer's Retreat",
    price: 19.99,
    category: "books",
    genre: "mystery",
    isBestseller: true,
    image: "/api/placeholder/300/300",
    description: "A gripping whodunit set at an exclusive writer's retreat in the mountains."
  },
  {
    title: "The Author's Romance",
    price: 15.99,
    category: "books",
    genre: "romance",
    isBestseller: false,
    image: "/api/placeholder/300/300",
    description: "A heartwarming story about two rival authors who fall in love."
  },
  {
    title: "Writer's Block Journal",
    price: 12.99,
    category: "my books",
    genre: "uncategorized",
    isBestseller: true,
    image: "/api/placeholder/300/300",
    description: "A guided journal with prompts to help overcome writer's block."
  }
];

const seedDB = async () => {
  await Book.deleteMany({});
  await Book.insertMany(bookSeeds);
  console.log('Database seeded!');
  mongoose.connection.close();
};

seedDB();