require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // required for cookies
}));
app.use(cookieParser());
app.use(express.json());

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, try again later' },
}));

app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 200,
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/shop',       require('./routes/shop'));       // public storefront
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/stats',      require('./routes/stats'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/brands',     require('./routes/brands'));
app.use('/api/attributes', require('./routes/attributes'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/coupons',    require('./routes/coupons'));
app.use('/api/reviews',    require('./routes/reviews'));
app.use('/api/settings',   require('./routes/settings'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
