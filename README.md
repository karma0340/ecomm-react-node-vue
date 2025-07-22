A comprehensive e-commerce solution featuring separate customer and admin interfaces, built with modern web technologies.

🌟 Overview
Customer Portal: React.js frontend with Bootstrap
Admin Dashboard: Vue.js frontend with server-side Handlebars
Backend: Node.js & Express with MySQL database
Payment Processing: Stripe integration
Authentication: JWT for customers, Session-based for admin
⚙️ Prerequisites
Node.js >= 14
MySQL >= 8.0
npm or yarn
🚀 Quick Start.............


Backend Setup:-----
cd backend
npm install

# Configure .env file:
# PORT=3000
# DB_HOST=localhost
# DB_USER=your_username
# DB_PASS=your_password
# DB_NAME=ecommerce
# JWT_SECRET=your_secret
# STRIPE_SECRET_KEY=your_stripe_key

npm run dev


Customer Frontend Setup:-------
cd my-frontend
npm install

# Configure .env file:
# REACT_APP_API_URL=http://localhost:3001
# REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key

npm start


Admin Frontend Setup:----------
cd admin-frontend
npm install


npm run serve
This is optional because am using all files of admin-frontend in backend/dist folder by using npm run build in admin-frontend.




🔑 Key Features>>>>>>>>

---Customer Portal----
User authentication & profile management
Product browsing with search & filters
Shopping cart & wishlist
Order placement & tracking
Secure payments via Stripe
Responsive design



Admin Dashboard
Secure admin authentication
Sales & inventory analytics
Product & category management
Order processing
User management
Real-time statistics




💾 Database Schema
Core Tables
Users (customers & admins)
Products
Categories
Orders
Cart Items
Wishlists



🔒 Security Features
JWT authentication (customers)
Session-based auth (admin)
Password hashing (bcrypt)
Input validation
CORS configuration
File upload validation


🧪 Running Tests
# Backend tests
cd backend
npm test

# Customer frontend tests
cd my-frontend
npm test

# Admin frontend tests
cd admin-frontend
npm test



📦 Build & Deployment
# Build customer frontend
cd my-frontend
npm run build

# Build admin frontend
cd admin-frontend
npm run build

# Start production server
cd backend
npm start

👤 Author
Mohit Tyagi

GitHub: @karma0340
Email: mohittyagi0340@gmail.com
📄 License
This project is MIT licensed.

🤝 Contributing
Fork the repo
Create feature branch (git checkout -b feature/amazing)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing)
Open a Pull Request
🙏 Acknowledgments
Green Hills Engineering College

Project Guide: Mr. Sumit Ranot
For detailed documentation and setup instructions, please refer to individual README files in each directory.

