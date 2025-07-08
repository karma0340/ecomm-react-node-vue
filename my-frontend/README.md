# E-Commerce Frontend (`my-frontend`)

This is the React.js frontend for the E-Commerce Web Application. It provides a modern, responsive user interface for customers to browse products, manage their cart and wishlist, place orders, and manage their accounts.

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

- User registration and login (JWT-based)
- Product browsing and search (with category filter)
- Add to cart, update quantity, remove from cart
- Wishlist functionality
- Place orders and view order history
- Responsive design for desktop and mobile
- Admin panel access (if authorized)
- Toast notifications for user feedback
- Secure session management
- Error handling and loading indicators

---

## Screenshots

> *(Add screenshots of your Home Page, Product List, Cart, Wishlist, Checkout, and Admin Panel here for better presentation.)*

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or above recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/e-comm.git
   cd e-comm/my-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (optional):**
   - Create a `.env` file in the root of `my-frontend` if you want to override default API URLs.
   - Example:
     ```
     REACT_APP_API_URL=http://localhost:3000
     ```

### Running the App

Start the development server:
```bash
npm start
```
The app will run at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```
Builds the app for production to the `build` folder.

---

## Folder Structure

```
my-frontend/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── api/              # API utility functions
│   ├── assets/           # Images, icons, etc.
│   ├── components/       # Reusable React components
│   ├── pages/            # Page-level components (Home, Cart, etc.)
│   ├── styles/           # Custom CSS/SCSS files
│   ├── App.js
│   ├── index.js
│   └── ...
├── .env                  # Environment variables (optional)
├── package.json
└── README.md
```

---

## API Endpoints

The frontend communicates with the backend via RESTful APIs.  
Example endpoints:
- `POST /api/auth/register` – User registration
- `POST /api/auth/login` – User login
- `GET /api/products` – List products
- `GET /api/products/:id` – Product details
- `POST /api/cart/items` – Add to cart
- `GET /api/cart` – View cart
- `PUT /api/cart/items/:id` – Update cart item quantity
- `DELETE /api/cart/items/:id` – Remove from cart
- `POST /api/orders` – Place order
- `GET /api/orders` – View order history
- `POST /api/wishlist/items` – Add to wishlist
- `GET /api/wishlist/items` – View wishlist

> **Note:** Make sure the backend server is running and accessible at the configured API URL.

---

## Environment Variables

You can use a `.env` file to override default settings.  
Example:
```
REACT_APP_API_URL=http://localhost:3000
```
Access these in your code via `process.env.REACT_APP_API_URL`.

---

## Customization

- Update API URLs in `src/api` or via environment variables as needed.
- Modify styles in `src/styles` or use Bootstrap classes.
- Change branding (logo, colors) in `src/assets` and `public/index.html`.

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

- [React.js](https://react.dev/)
- [Bootstrap](https://getbootstrap.com/)
- [Axios](https://axios-http.com/)
- [FontAwesome](https://fontawesome.com/)
- [Toastify](https://fkhadra.github.io/react-toastify/)

---

**Developed as a college project.**