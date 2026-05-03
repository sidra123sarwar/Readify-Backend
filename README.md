# Readify Backend

A full-featured book e-commerce and recommendation platform with AI-powered book discovery, user authentication, shopping cart, and admin management capabilities.

## 🚀 Features

- **AI-Powered Recommendations**: Semantic-based book recommendations using sentence transformers and cosine similarity
- **User Authentication**: Secure JWT-based authentication with email verification
- **Shopping Cart & Orders**: Complete e-commerce functionality with order management
- **Favorites System**: Users can bookmark their favorite books
- **Admin Dashboard**: Administrative panel for managing books, users, and inventory
- **File Uploads**: Image upload support for book covers and user avatars
- **Stock Management**: Real-time inventory tracking and updates
- **User Profiles**: Comprehensive user profile management with password reset capabilities
- **CORS Support**: Ready for frontend integration

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js (v14+) |
| **Backend Framework** | Express.js 5.x |
| **Database** | MongoDB 4.x+ |
| **Authentication** | JWT (jsonwebtoken) |
| **Password Hashing** | bcryptjs |
| **ML Engine** | Python 3.x + Sentence Transformers |
| **File Uploads** | Multer |
| **Validation** | express-validator |
| **Email** | Nodemailer |

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas URI)
- Python 3.7+ (for recommendation engine)
- npm or yarn

## 🔧 Installation

### 1. Clone & Setup

```bash
# Clone the repository
git clone <repository-url>
cd backend

# Install Node dependencies
npm install

# Install Python dependencies
pip install pandas numpy sentence-transformers scikit-learn
```

### 2. Environment Configuration

Create a `.env` file in the backend root directory:

```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/writers-shop

# Frontend
FRONT_END_URL=http://localhost:3000

# Authentication
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRES_IN=7d

# Email (for password reset & verification)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# File Uploads
UPLOAD_PATH=./uploads
ASSET_PATH=D:/assets
```

**⚠️ Important**: Never commit `.env` to version control. Use environment variables in production.

### 3. Prepare Recommendation Data

The recommendation engine requires pre-computed book embeddings:

```bash
# Generate embeddings from your book CSV
python preparedata.py
```

This creates:
- `book_embeddings.npy` - Embeddings for semantic search
- `book_titles.txt` - Book titles
- `book_authors.txt` - Book authors
- `book_isbns.txt` - ISBN numbers

### 4. Initialize Database

```bash
# (Optional) Seed initial data
node scripts/createAdmin.js      # Create admin user
node scripts/fixStock.js         # Fix inventory issues
node scripts/updateImages.js     # Update image paths
```

## 🚀 Getting Started

### Start the Server

```bash
npm start
```

Server runs on: `http://localhost:5000` (or your configured PORT)

### Verify Setup

```bash
# Check MongoDB connection
curl http://localhost:5000/api/books

# If connected, returns: []
```

## 📚 API Documentation

### Authentication Routes
```
POST   /api/auth/register           - Register new user
POST   /api/auth/login              - Login user
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/reset-password     - Reset password
```

### Books Routes
```
GET    /api/books                   - Get all books
GET    /api/books/:id               - Get book by ID
POST   /api/books                   - Add new book (Admin)
PUT    /api/books/:id               - Update book (Admin)
DELETE /api/books/:id               - Delete book (Admin)
```

### User Routes
```
GET    /api/users/profile           - Get user profile
PUT    /api/users/profile           - Update user profile
GET    /api/users                   - Get all users (Admin)
```

### Shopping Cart
```
GET    /api/cart                    - Get user's cart
POST   /api/cart                    - Add item to cart
PUT    /api/cart/:id                - Update cart item
DELETE /api/cart/:id                - Remove cart item
```

### Favorites
```
GET    /api/favorites               - Get user's favorites
POST   /api/favorites               - Add to favorites
DELETE /api/favorites/:bookId       - Remove from favorites
```

### Orders
```
GET    /api/orders                  - Get user's orders
POST   /api/orders                  - Create new order
GET    /api/orders/:id              - Get order details
```

### Admin Routes
```
GET    /api/admin/stats             - Get dashboard statistics
GET    /api/admin/users             - Manage users
GET    /api/admin/orders            - View all orders
```

### AI Recommendations
```
POST   /api/recommend
Body: { "query": "romance novels" }
Response: [
  {
    "title": "Book Title",
    "author": "Author Name",
    "isbn": "ISBN number",
    "cover": "https://covers.openlibrary.org/...",
    "score": 0.95
  },
  ...
]
```

### File Upload
```
POST   /api/upload
Form: multipart/form-data with 'image' field
Response: { "filePath": "/uploads/1234567890.jpg" }
```

## 🤖 AI Recommendation Engine

The recommendation system uses **Sentence Transformers** (all-MiniLM-L6-v2 model) to:

1. Convert book descriptions into semantic embeddings
2. Compare user queries against pre-computed embeddings
3. Return top 5 most similar books using cosine similarity

### How It Works

```
User Query
    ↓
[Model Encoding]
    ↓
Semantic Vector
    ↓
[Cosine Similarity]
    ↓
Top 5 Recommendations
```

### Customize Recommendations

Edit `recommend.py` to:
- Change model: `SentenceTransformer("model-name")`
- Adjust results: Change `-5:` to desired count
- Modify description input: Update `descriptions` variable

## 📁 Project Structure

```
backend/
├── controllers/          # Business logic
│   ├── userController.js
│   ├── adminController.js
│   ├── cartControllers.js
│   ├── favoritesControllers.js
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Book.js
│   ├── Order.js
│   └── Admin.js
├── routes/              # API route definitions
├── middleware/          # Auth & custom middleware
│   ├── auth.js          # JWT verification
│   └── adminAuth.js
├── scripts/             # Utility scripts
├── seeds/               # Database seeds
├── uploads/             # File upload directory
├── preparedata.py       # Generate embeddings
├── recommend.py         # ML recommendation engine
├── server.js            # Express app entry point
└── package.json
```

## 🔐 Authentication

### User Authentication Flow

```
1. User Signup → Email Verification
2. User Login → JWT Token (7 days)
3. Protected Routes → Verify JWT
4. Forgot Password → Email Reset Link
```

### Using Protected Routes

Include token in Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/users/profile
```

## 🛡️ Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- CORS protection
- Input validation with express-validator
- Environment-based configuration
- Admin role-based access control

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection fails | Verify `MONGODB_URI` in `.env` and MongoDB service is running |
| Embeddings not found | Run `python preparedata.py` with your books.csv |
| CORS errors | Check `FRONT_END_URL` in `.env` matches frontend origin |
| File upload fails | Ensure `uploads/` directory exists and has write permissions |
| Python script errors | Install requirements: `pip install -r requirements.txt` |

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | Database connection | `mongodb://localhost:27017/writers-shop` |
| `FRONT_END_URL` | Allowed CORS origin | `http://localhost:3000` |
| `JWT_SECRET` | Token signing key | `your_secret_key` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `EMAIL_USER` | Gmail for notifications | `your@gmail.com` |
| `EMAIL_PASS` | Gmail app password | `xxxx xxxx xxxx xxxx` |

## 🤝 Contributing

We welcome contributions! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

For major changes, open an issue first to discuss proposed changes.

## 📄 License

This project is licensed under the ISC License. See LICENSE file for details.

## 👥 Support & Contact

For questions or issues:
- Open an GitHub issue for bug reports
- Check existing documentation for FAQs
- Contact the development team

## 🎯 Roadmap

- [ ] Advanced filtering and search
- [ ] Book reviews and ratings
- [ ] Wishlist functionality
- [ ] Email notifications for orders
- [ ] Payment gateway integration
- [ ] Real-time inventory alerts
- [ ] Enhanced recommendation metrics

---

**Made with ❤️ for book lovers** | Version 1.0.0
