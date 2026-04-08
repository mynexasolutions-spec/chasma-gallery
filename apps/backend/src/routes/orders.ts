import { Router } from 'express';
import { getAll, getOne, updateStatus, updatePaymentStatus, getMyOrders, getMyOrderById } from '../controllers/ordersController';
import { authenticate, authorize } from '../middleware/auth';
import validate from '../middleware/validate';
import { updateOrderStatusSchema, updatePaymentStatusSchema } from '../schemas/order.schema';

const router = Router();

router.get('/my-orders', authenticate, getMyOrders);
router.get('/my-orders/:id', authenticate, getMyOrderById);

router.use(authenticate, authorize('admin', 'manager'));
router.get('/', getAll);
router.get('/:id', getOne);
router.patch('/:id/status', validate(updateOrderStatusSchema), updateStatus);
router.patch('/:id/payment-status', validate(updatePaymentStatusSchema), updatePaymentStatus);

export default router;

