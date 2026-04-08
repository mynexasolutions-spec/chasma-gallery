# API Reference

Base URL: `http://localhost:5000/api`

All responses follow this format:
```json
{ "success": true, "data": {...} }
{ "success": false, "message": "Error description" }
```

Paginated responses also include:
```json
{
  "pagination": { "total": 100, "page": 1, "limit": 20, "pages": 5 }
}
```

---

## Authentication

Authentication uses **HTTP-only cookies**. After login, a `token` cookie is set automatically. All subsequent requests include it.

### POST `/auth/login`
Login and receive JWT cookie.

**Body:**
```json
{ "email": "admin@store.com", "password": "Admin@1234" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid", "first_name": "Admin", "last_name": "User",
    "email": "admin@store.com", "role": "admin"
  }
}
```

### POST `/auth/logout`
Clears the auth cookie.

### GET `/auth/me`
🔒 **Requires auth**. Returns current user info.

---

## Products

### GET `/products`
List products with filters.

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Per page (default: 20) |
| `search` | string | Search by name |
| `stock_status` | string | `in_stock`, `out_of_stock`, `backorder` |
| `category_id` | uuid | Filter by category |
| `brand_id` | uuid | Filter by brand |

### GET `/products/:id`
Get single product with full details.

### POST `/products`
🔒 **Admin only**. Create product.

**Body:**
```json
{
  "name": "Product Name",
  "slug": "product-name",
  "sku": "SKU-001",
  "type": "simple",
  "description": "Full description",
  "short_description": "Brief summary",
  "price": 29.99,
  "sale_price": 24.99,
  "stock_quantity": 100,
  "stock_status": "in_stock",
  "manage_stock": true,
  "category_id": "uuid",
  "brand_id": "uuid",
  "is_featured": false,
  "is_active": true
}
```

### PUT `/products/:id`
🔒 **Admin only**. Update product (same body as create).

### DELETE `/products/:id`
🔒 **Admin only**. Delete product.

---

## Product Images

### GET `/products/:id/images`
🔒 **Admin/Manager**. List all images for a product.

### POST `/products/:id/images`
🔒 **Admin only**. Upload images.

**Content-Type:** `multipart/form-data`
**Field:** `images` (accepts multiple files)

### PUT `/products/:id/images/:imageId/primary`
🔒 **Admin only**. Set an image as the primary image.

### DELETE `/products/:id/images/:imageId`
🔒 **Admin only**. Delete an image (also removes from Cloudinary).

---

## Product Variations

### GET `/products/:id/variations`
🔒 **Admin/Manager**. List variations with their attribute values.

### POST `/products/:id/variations`
🔒 **Admin only**. Create a variation.

**Body:**
```json
{
  "sku": "SKU-001-RED-M",
  "price": 29.99,
  "sale_price": null,
  "stock_quantity": 50,
  "attribute_value_ids": ["uuid-color-red", "uuid-size-m"]
}
```

### PUT `/products/:id/variations/:varId`
🔒 **Admin only**. Update variation (same body).

### DELETE `/products/:id/variations/:varId`
🔒 **Admin only**. Delete variation.

---

## Categories

### GET `/categories`
List all categories (returns `{ categories: [...] }`).

### GET `/categories/:id`
Get single category.

### POST `/categories`
🔒 **Admin only**. Create category.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Category name |
| `slug` | string | ✅ | URL slug |
| `description` | string | | Description |
| `parent_id` | uuid | | Parent category ID |
| `image` | file | | Category image |

### PUT `/categories/:id`
🔒 **Admin only**. Update category (same fields).

### DELETE `/categories/:id`
🔒 **Admin only**. Delete category.

---

## Brands

### GET `/brands`
List all brands (returns `{ brands: [...] }`).

### GET `/brands/:id`
Get single brand.

### POST `/brands`
🔒 **Admin only**. Create brand.

**Content-Type:** `multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✅ |
| `slug` | string | ✅ |
| `logo` | file | |

### PUT `/brands/:id`
🔒 **Admin only**. Update brand.

### DELETE `/brands/:id`
🔒 **Admin only**. Delete brand.

---

## Orders

### GET `/orders`
🔒 **Admin/Manager**. List orders with filters.

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number |
| `limit` | number | Per page |
| `search` | string | Search by order # or email |
| `status` | string | `pending`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| `payment_status` | string | `unpaid`, `paid`, `refunded` |

### GET `/orders/:id`
🔒 **Admin/Manager**. Get order with items and payments.

### PATCH `/orders/:id/status`
🔒 **Admin/Manager**. Update order status.

**Body:**
```json
{ "status": "shipped" }
```

### PATCH `/orders/:id/payment-status`
🔒 **Admin/Manager**. Update payment status.

**Body:**
```json
{ "payment_status": "paid" }
```

### GET `/orders/my-orders`
🔒 **Any authenticated user**. Get current user's orders.

### GET `/orders/my-orders/:id`
🔒 **Any authenticated user**. Get specific order details.

---

## Users

### GET `/users`
🔒 **Admin/Manager**. List users with filters.

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search by name or email |
| `role` | string | `admin`, `manager`, `customer` |
| `status` | string | `active`, `blocked` |

### GET `/users/:id`
🔒 **Admin/Manager**. Get user with addresses and recent orders.

### POST `/users`
🔒 **Admin/Manager**. Create user.

**Body:**
```json
{
  "first_name": "John", "last_name": "Doe",
  "email": "john@example.com", "password": "Secret123",
  "role": "customer"
}
```

### PUT `/users/:id`
🔒 **Admin/Manager**. Update user (no password change).

### PATCH `/users/:id/status`
🔒 **Admin/Manager**. Block or activate.

**Body:**
```json
{ "status": "blocked" }
```

### DELETE `/users/:id`
🔒 **Admin/Manager**. Delete user.

---

## Attributes

### GET `/attributes`
🔒 **Admin/Manager**. List attributes with value counts.

### GET `/attributes/:id`
🔒 **Admin/Manager**. Get attribute with its values.

### POST `/attributes`
🔒 **Admin/Manager**. Create attribute.

**Body:**
```json
{ "name": "Color", "slug": "color" }
```

### PUT `/attributes/:id`
🔒 **Admin/Manager**. Update attribute.

### DELETE `/attributes/:id`
🔒 **Admin/Manager**. Delete (fails if in use by variations).

### GET `/attributes/:id/values`
🔒 List values for an attribute.

### POST `/attributes/:id/values`
🔒 Add a value.

**Body:** `{ "value": "Red" }`

### PUT `/attributes/:attrId/values/:valueId`
🔒 Update a value.

### DELETE `/attributes/:attrId/values/:valueId`
🔒 Delete a value (fails if in use).

---

## Coupons

### GET `/coupons`
🔒 **Admin only**. List all coupons with usage counts.

### POST `/coupons`
🔒 **Admin only**.

**Body:**
```json
{
  "code": "SAVE20",
  "type": "percentage",
  "value": 20,
  "usage_limit": 100,
  "expires_at": "2026-12-31T23:59:59Z",
  "is_active": true
}
```

### PUT `/coupons/:id`
🔒 **Admin only**. Update coupon (same body).

### DELETE `/coupons/:id`
🔒 **Admin only**.

---

## Reviews

### GET `/reviews`
🔒 **Admin/Manager**. List reviews.

| Param | Type | Description |
|-------|------|-------------|
| `is_approved` | string | `true` or `false` |
| `page` | number | Page number |
| `limit` | number | Per page |

### PATCH `/reviews/:id/approve`
🔒 Approve a review.

### PATCH `/reviews/:id/reject`
🔒 Reject a review.

### DELETE `/reviews/:id`
🔒 Delete a review.

---

## Settings

### GET `/settings`
🔒 **Admin only**. Returns all settings as a key-value object.

### PUT `/settings`
🔒 **Admin only**. Upsert multiple settings.

**Body:**
```json
{
  "settings": {
    "store_name": "My Store",
    "currency": "USD",
    "razorpay_key_id": "rzp_..."
  }
}
```

---

## Shop (Public)

These endpoints require **no authentication**.

### GET `/shop/featured`
Get featured products (max 8).

### GET `/shop/new-arrivals`
Get newest products (max 8).

### GET `/shop/categories`
List categories with product counts.

### GET `/shop/brands`
List brands with product counts.

### GET `/shop/products`
Browse products with filters.

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search name/description |
| `category` | uuid | Category ID |
| `brand` | uuid | Brand ID |
| `min_price` | number | Minimum price |
| `max_price` | number | Maximum price |
| `stock_status` | string | Stock filter |
| `sort` | string | `newest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`, `featured` |
| `page` | number | Page |
| `limit` | number | Per page (default: 12) |

Response includes `priceRange: { min_price, max_price }` for filter UI.

### GET `/shop/products/:id`
Full product detail: images, reviews, average rating, variations.

---

## Payment

### POST `/payment/create-order`
Optional auth. Create a Razorpay order. The backend calculates true pricing and stock quantities securely from the database; the frontend only needs to send product IDs and requested quantities.

**Body:**
```json
{
  "items": [{ "id": "uuid", "name": "Product", "quantity": 1 }],
  "billing": { "name": "John", "address": "..." },
  "coupon_code": "SAVE20" 
}
```

*Note: The `coupon_code` parameter is optional. The backend will automatically calculate shipping fees and discounts.*

### POST `/payment/verify-payment`
Verify Razorpay payment signature.

### POST `/payment/create-cod-order`
Optional auth. Create a Cash on Delivery order (same body as create-order, minus Razorpay).

---

## Stats / Dashboard

### GET `/stats/overview`
🔒 **Admin/Manager**. Dashboard summary cards.

### GET `/stats/revenue?days=7`
🔒 Revenue data for charts (7, 14, or 30 days).

### GET `/stats/category-sales`
🔒 Revenue breakdown by category.

### GET `/stats/top-customers`
🔒 Top 5 customers by spend.

---

## Health Check

### GET `/health`
Returns `{ "status": "ok" }`. No auth required.
