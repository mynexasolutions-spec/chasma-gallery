import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/couponsController';
import { authenticate, authorize } from '../middleware/auth';
import validate from '../middleware/validate';
import { createCouponSchema, updateCouponSchema } from '../schemas/coupon.schema';

const router = Router();
router.use(authenticate, authorize('admin'));

router.get('/', getAll);
router.post('/', validate(createCouponSchema), create);
router.put('/:id', validate(updateCouponSchema), update);
router.delete('/:id', remove);

export default router;

