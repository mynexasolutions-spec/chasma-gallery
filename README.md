# E-Commerce Dashboard

Full-stack admin dashboard for managing an e-commerce store.

**Stack:** React + Vite + Bootstrap 5 (frontend) · Node.js + Express + PostgreSQL (backend)

---

## Project Structure

```
ecommerce-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── authController.js   # Login, logout, /me
│   │   │   ├── statsController.js  # Dashboard overview stats
│   │   │   ├── productsController.js
│   │   │   ├── ordersController.js
│   │   │   ├── usersController.js
│   │   │   ├── couponsController.js
│   │   │   ├── reviewsController.js
│   │   │   └── settingsController.js
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT authentication + role authorization
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── stats.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── users.js
│   │   │   ├── coupons.js
│   │   │   ├── reviews.js
│   │   │   └── settings.js
│   │   └── server.js               # Express entry point
│   ├── seed.sql                    # Database schema + test data
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   └── Layout.jsx
    │   │   └── ui/
    │   │       └── index.jsx       # Spinner, Badge, Pagination, StatCard, Alert
    │   ├── context/
    │   │   └── AuthContext.jsx     # Global auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx       # Overview stats + recent orders
    │   │   ├── Products.jsx        # CRUD
    │   │   ├── Orders.jsx          # List + status update
    │   │   ├── Users.jsx           # List + block/unblock
    │   │   ├── Coupons.jsx         # CRUD
    │   │   ├── Reviews.jsx         # Approve / delete
    │   │   └── Settings.jsx        # Store config
    │   ├── services/
    │   │   └── api.js              # Axios instance (credentials: true)
    │   ├── App.jsx                 # Routes + protected route guards
    │   └── main.jsx
    ├── vite.config.js              # Proxy /api → localhost:5000
    └── package.json
```

---

## Setup

### 1. PostgreSQL — create database and seed

```bash
psql -U postgres -c "CREATE DATABASE ecommerce_db;"
psql -U postgres -d ecommerce_db -f backend/seed.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env       # fill in your DB credentials and JWT secret
npm install
npm run dev                # runs on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                # runs on http://localhost:5173
```

---

## Test Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@store.com        | Admin@1234  |
| Manager | manager@store.com      | Admin@1234  |

---

## API Endpoints

| Method | Endpoint                    | Auth         | Description              |
|--------|-----------------------------|--------------|--------------------------|
| POST   | /api/auth/login             | —            | Login                    |
| POST   | /api/auth/logout            | ✓            | Logout                   |
| GET    | /api/auth/me                | ✓            | Current user             |
| GET    | /api/stats/overview         | admin/manager| Dashboard stats          |
| GET    | /api/products               | admin/manager| List products            |
| POST   | /api/products               | admin only   | Create product           |
| PUT    | /api/products/:id           | admin only   | Update product           |
| DELETE | /api/products/:id           | admin only   | Delete product           |
| GET    | /api/orders                 | admin/manager| List orders              |
| GET    | /api/orders/:id             | admin/manager| Order detail             |
| PATCH  | /api/orders/:id/status      | admin/manager| Update order status      |
| GET    | /api/users                  | admin/manager| List users               |
| POST   | /api/users                  | admin/manager| Create user              |
| PATCH  | /api/users/:id/status       | admin/manager| Block/unblock user       |
| GET    | /api/coupons                | admin only   | List coupons             |
| POST   | /api/coupons                | admin only   | Create coupon            |
| PUT    | /api/coupons/:id            | admin only   | Update coupon            |
| DELETE | /api/coupons/:id            | admin only   | Delete coupon            |
| GET    | /api/reviews                | admin/manager| List reviews             |
| PATCH  | /api/reviews/:id/approve    | admin/manager| Approve review           |
| DELETE | /api/reviews/:id            | admin/manager| Delete review            |
| GET    | /api/settings               | admin only   | Get settings             |
| PUT    | /api/settings               | admin only   | Save settings            |

---

## Security

- JWT stored in **httpOnly cookie** — not accessible via JavaScript
- Passwords hashed with **bcrypt** (12 rounds) — never stored in plain text
- **Helmet.js** sets security headers automatically
- **Rate limiting** on login (10 requests / 15 min) and all API routes
- All DB queries use **parameterized statements** — no SQL injection risk
- Role-based access: admin vs manager permissions enforced server-side
- Sensitive data (password_hash, internal flags) never sent to frontend
- CORS restricted to frontend origin only
