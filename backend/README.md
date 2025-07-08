# E-Commerce Backend (`backend`)

This is the backend for the E-Commerce Web Application, built with Node.js, Express.js, and MySQL (via Sequelize ORM). It provides RESTful APIs for user authentication, product management, cart, orders, wishlist, and admin functionalities.

---

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Admin Panel](#admin-panel)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

- User registration and login (JWT-based)
- Product, category, and subcategory management
- Cart and wishlist management
- Order placement and history
- Admin panel with authentication and dashboard
- Secure password hashing and session management
- RESTful API design

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or above recommended)
- npm (comes with Node.js)
- [MySQL](https://www.mysql.com/) database

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/e-comm.git
   cd e-comm/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the `backend` folder with the following content:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=yourpassword
     DB_NAME=ecommdb
     JWT_SECRET=your_jwt_secret
     SESSION_SECRET=your_session_secret
     CORS_ORIGIN=http://localhost:3000
     ```

4. **Set up the database:**
   - Create a MySQL database named as per `DB_NAME` in your `.env`.
   - The app will auto-create tables on first run using Sequelize.

### Running the Server

```bash
npm start
```
The backend server will run at [http://localhost:3000](http://localhost:3000).

---

## Folder Structure

```
backend/
├── admin/
│   ├── routes/
│   └── views/
├── middleware/
├── models/
├── routes/
├── views/
├── server.js
├── package.json
└── README.md
```

---

## Environment Variables

The backend uses a `.env` file for configuration.  
Example:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=ecommdb
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://localhost:3000
```

---

## API Endpoints

- `POST /api/auth/register` – Register user
- `POST /api/auth/login` – Login user
- `GET /api/products` – List products
- `GET /api/products/:id` – Product details
- `POST /api/cart/items` – Add item to cart
- `GET /api/cart` – View cart
- `PUT /api/cart/items/:id` – Update cart item quantity
- `DELETE /api/cart/items/:id` – Remove from cart
- `POST /api/orders` – Place order
- `GET /api/orders` – View order history
- `POST /api/wishlist/items` – Add to wishlist
- `GET /api/wishlist/items` – Get wishlist items
- `GET /api/users/me` – Get current user info

> See `routes/` for all available endpoints.

---

## Admin Panel

- Accessible at `/admin`
- Admin authentication required
- Manage products, categories, users, orders, and notifications
- Handlebars-based views for admin dashboard

---

## Security

- Passwords are hashed using bcrypt
- JWT for API authentication
- Session management for admin panel
- CORS enabled for frontend-backend communication
- Input validation and error handling

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

---

## License

This project is for educational purposes.

---

## Acknowledgements

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MySQL](https://www.mysql.com/)
- [Sequelize](https://sequelize.org/)
- [bcrypt](https://www.npmjs.com/package/bcrypt)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [Handlebars](https://handlebarsjs.com/)

---

**Developed as a college project.**