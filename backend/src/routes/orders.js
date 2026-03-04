const router = require('express').Router();
const c = require('../controllers/ordersController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'manager'));
router.get('/',           c.getAll);
router.get('/:id',        c.getOne);
router.patch('/:id/status', c.updateStatus);
router.patch('/:id/payment-status', c.updatePaymentStatus);

module.exports = router;
