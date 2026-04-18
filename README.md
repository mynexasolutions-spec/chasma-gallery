# ChasmaGallery — E-Commerce Storefront (Flask)

A sleek, modern, and high-performance e-commerce platform for designer eyewear, built with Python/Flask and PostgreSQL.

## Features

- **Storefront**: High-end visual design with glassmorphism, responsive product grids, and advanced filtering.
- **Admin Dashboard**: Comprehensive management of products, categories, brands, orders, and attributes.
- **Dynamic Homepage**: Featured carousels, trending shapes navigation, and shop-by-category sections powered by the CMS.
- **Variable Products**: Robust support for product variations (e.g., lens power for contacts/eyeglasses).
- **Glass-Modern UI**: Premium styling using a custom design system in `static/css/chasma.css`.

## Architecture

```
ecom-dashboard/
└── apps/                  # Primary Flask Application
    ├── static/            # CSS, Javascript, and Images
    ├── templates/         # Jinja2 HTML Templates
    ├── routes/            # Modular Blueprints (Public, Admin, Auth, etc.)
    ├── app.py             # Main Entry point (Factory pattern)
    ├── db.py              # Database Connection Pool
    └── queries.py         # Specialized DB Queries
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Core** | Python 3.x, Flask |
| **Database** | PostgreSQL (Supabase) |
| **Templating** | Jinja2 |
| **Styling** | Vanilla CSS (Custom Design System) |
| **Frontend** | Vanilla JS (Zero dependencies) |

## Quick Start

### 1. Configure environment
Ensure you have a `.env` file in `apps/` with your Supabase credentials:
```env
DB_URL=postgresql://user:password@host:5432/dbname
```

### 2. Start development server
```bash
cd apps
python app.py
```

### 3. Access the app
- **Storefront:** http://127.0.0.1:5001/
- **Admin Dashboard:** http://127.0.0.1:5001/admin

## Admin Access
Access the administrative panel via `/admin`. Ensure your user has `admin` role in the database.

## Professional CSS
The site uses a custom design system defined in `apps/flask/static/css/chasma.css`. It features:
- Glassmorphism effects
- Modern typography (Outfit / Inter)
- Dynamic micro-animations
- Mobile-first responsiveness
