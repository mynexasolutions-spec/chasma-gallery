import { Router } from 'express';
import { overview, revenueChart, salesByCategory, topCustomers } from '../controllers/statsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/overview',          authenticate, authorize('admin', 'manager'), overview);
router.get('/revenue-chart',     authenticate, authorize('admin', 'manager'), revenueChart);
router.get('/sales-by-category', authenticate, authorize('admin', 'manager'), salesByCategory);
router.get('/top-customers',     authenticate, authorize('admin', 'manager'), topCustomers);

export default router;
