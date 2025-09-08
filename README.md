# Restaurant Management System (POS)

A full-stack Restaurant Management System built with the MERN stack, featuring a modern Point of Sale interface, order management, menu management, and table management.

## Features

### 🍽️ Point of Sale (POS)
- Interactive menu with categories
- Real-time cart management
- Support for dine-in, takeaway, and delivery orders
- Table selection for dine-in orders
- Customer information management

### 📊 Dashboard
- Daily sales statistics
- Order analytics
- Revenue tracking
- Recent orders overview
- Quick actions

### 📋 Order Management
- Real-time order tracking
- Order status updates (Pending → Preparing → Ready → Completed)
- Payment status management
- Order filtering and search
- Detailed order views

### 🍕 Menu Management
- Category management
- Menu item CRUD operations
- Vegetarian/Non-vegetarian indicators
- Price and availability management
- Preparation time tracking

### 🪑 Table Management
- Table status tracking (Available, Occupied, Reserved, Maintenance)
- Capacity management
- Location-based organization (Indoor, Outdoor, Private)

### 👥 User Management
- Role-based access control (Admin, Manager, Cashier, Waiter)
- Secure authentication with JWT
- User-specific permissions

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - UI components
- **React Router** - Navigation
- **TanStack Query** - Data fetching and caching
- **React Toastify** - Notifications
- **Date-fns** - Date formatting

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-pos-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/restaurant_pos
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system.

6. **Seed the Database**
   ```bash
   cd backend
   npm run seed
   ```

7. **Start the Application**
   
   Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```
   
   Start the frontend (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```

8. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Default Login Credentials

After running the seed script, you can log in with:

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@restaurant.com     | password123 |
| Manager  | manager@restaurant.com   | password123 |
| Cashier  | cashier@restaurant.com   | password123 |
| Waiter   | waiter@restaurant.com    | password123 |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (Manager/Admin)
- `PUT /api/categories/:id` - Update category (Manager/Admin)
- `DELETE /api/categories/:id` - Delete category (Manager/Admin)

### Menu Items
- `GET /api/menu-items` - Get all menu items
- `GET /api/menu-items/:id` - Get single menu item
- `POST /api/menu-items` - Create menu item (Manager/Admin)
- `PUT /api/menu-items/:id` - Update menu item (Manager/Admin)
- `DELETE /api/menu-items/:id` - Delete menu item (Manager/Admin)

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/available` - Get available tables
- `POST /api/tables` - Create table (Manager/Admin)
- `PUT /api/tables/:id` - Update table (Manager/Admin)
- `PATCH /api/tables/:id/status` - Update table status
- `DELETE /api/tables/:id` - Delete table (Manager/Admin)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/today` - Get today's orders
- `GET /api/orders/stats` - Get order statistics
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `PATCH /api/orders/:id/status` - Update order status
- `PATCH /api/orders/:id/payment` - Update payment status

## Project Structure

```
restaurant-pos-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── categoryController.js
│   │   ├── menuItemController.js
│   │   ├── orderController.js
│   │   └── tableController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── Category.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Table.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── categories.js
│   │   ├── menuItems.js
│   │   ├── orders.js
│   │   └── tables.js
│   ├── .env
│   ├── package.json
│   ├── seeder.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── CartContext.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Orders.tsx
│   │   │   └── POS.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── authService.ts
│   │   │   ├── menuService.ts
│   │   │   └── orderService.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── README.md
```

## Usage Guide

### 1. Dashboard
- View daily statistics and metrics
- Monitor recent orders
- Quick access to key features

### 2. Point of Sale
- Browse menu items by category
- Add items to cart with quantities
- Select order type (dine-in, takeaway, delivery)
- For dine-in: select available table
- For delivery: enter customer details
- Process orders with automatic calculations

### 3. Order Management
- View all orders with filtering options
- Update order status as items are prepared
- Manage payment status
- View detailed order information

### 4. Menu Management (Admin/Manager only)
- Create and manage categories
- Add, edit, and remove menu items
- Set prices and preparation times
- Mark items as available/unavailable

### 5. Table Management (Admin/Manager only)
- Add and configure tables
- Update table status
- Organize by location (indoor/outdoor/private)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Protected API endpoints
- Input validation and sanitization

## Performance Features

- React Query for efficient data caching
- Optimistic updates for better UX
- Lazy loading and code splitting
- Responsive design for all devices

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email mbasit467@gmail.com or create an issue in the repository.
# restaurant-pos-system
