# Ecommerce Dashboard — Monorepo

A full-stack ecommerce admin dashboard with a TypeScript Node.js/Express backend and Next.js frontend.

## Architecture

```
ecommerce-dashboard/
├── apps/
│   ├── backend/          # Express + TypeScript API (port 5000)
│   └── frontend/         # Next.js + Tailwind admin panel (port 3001)
├── packages/
│   └── shared-types/     # Shared TypeScript interfaces
├── API_REFERENCE.md      # Complete API documentation
└── package.json          # npm workspaces root
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT (HTTP-only cookies) |
| **File Storage** | Cloudinary |
| **Frontend** | Next.js 16 (App Router), Tailwind CSS |
| **Package Manager** | npm workspaces |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase account)
- Cloudinary account (for image uploads)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy the env template and fill in your values:
```bash
cp apps/backend/.env.example apps/backend/.env
```

Required environment variables:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Seed the database
Run the seed file against your PostgreSQL database:
```bash
psql -U postgres -d your_db -f apps/backend/seed.sql
```
Or via Supabase SQL editor: paste the contents of `apps/backend/seed.sql`.

### 4. Start development servers

**Terminal 1 — Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd apps/frontend
npm run dev
```

### 5. Access the app
- **Storefront (Public):** http://localhost:3001/
- **Admin Dashboard:** http://localhost:3001/admin/login
- **Backend API API Health:** http://localhost:5000/api/health

### Default Admin Credentials
```
Email:    admin@store.com
Password: Admin@1234
```

## API Documentation

See [API_REFERENCE.md](./API_REFERENCE.md) for the complete API reference with all endpoints, request/response formats, and authentication requirements.

## Backend Structure

```
apps/backend/src/
├── config/
│   ├── db.ts              # PostgreSQL pool
│   └── cloudinary.ts      # Cloudinary config
├── controllers/
│   ├── authController.ts
│   ├── productsController.ts
│   ├── productDetailsController.ts  # Images + Variations
│   ├── categoriesController.ts
│   ├── brandsController.ts
│   ├── ordersController.ts
│   ├── usersController.ts
│   ├── attributesController.ts
│   ├── couponsController.ts
│   ├── reviewsController.ts
│   ├── settingsController.ts
│   ├── statsController.ts
│   ├── shopController.ts
│   └── paymentController.ts
├── middleware/
│   ├── auth.ts            # JWT auth + role-based authorization
│   ├── upload.ts          # Multer file upload
│   └── errorHandler.ts    # Global error handler
├── routes/                # Express route definitions
└── server.ts              # App entry point
```

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full access to everything |
| `manager` | Read/write access to products, orders, reviews |
| `customer` | Can view own orders, write reviews |

## Database Schema

The database includes the following tables:
- `users`, `user_addresses`
- `categories`, `brands`
- `products`, `product_images`, `product_variations`
- `attributes`, `attribute_values`, `variation_attribute_values`
- `orders`, `order_items`, `payments`
- `reviews`, `coupons`, `coupon_usages`
- `carts`, `cart_items`
- `media`, `settings`

See `apps/backend/seed.sql` for the full schema and sample data.

## Testing

The backend includes a comprehensive Jest + Supertest integration test suite.

```bash
cd apps/backend
npm run test
```

## Type Checking

```bash
cd apps/backend
npx tsc --noEmit   # Should output 0 errors
```

## License

ISC
