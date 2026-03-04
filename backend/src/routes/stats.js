const router = require('express').Router();
const { overview, revenueChart, salesByCategory, topCustomers } = require('../controllers/statsController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/overview',          authenticate, authorize('admin', 'manager'), overview);
router.get('/revenue-chart',     authenticate, authorize('admin', 'manager'), revenueChart);
router.get('/sales-by-category', authenticate, authorize('admin', 'manager'), salesByCategory);
router.get('/top-customers',     authenticate, authorize('admin', 'manager'), topCustomers);

module.exports = router;
