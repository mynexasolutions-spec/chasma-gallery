import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import statsRoutes from './routes/stats';
import categoryRoutes from './routes/categories';
import brandRoutes from './routes/brands';
import orderRoutes from './routes/orders';
import userRoutes from './routes/users';
import attributeRoutes from './routes/attributes';
import couponRoutes from './routes/coupons';
import reviewRoutes from './routes/reviews';
import settingsRoutes from './routes/settings';
import shopRoutes from './routes/shop';
import paymentRoutes from './routes/payment';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, try again later'
}));

app.use('/api/', rateLimit({
  windowMs: 60 * 1000,
  max: 200,
}));

// Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attributes', attributeRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
