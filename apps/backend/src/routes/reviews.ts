import { Router } from 'express';
import { getAll, approve, reject, remove } from '../controllers/reviewsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('admin', 'manager'));

router.get('/', getAll);
router.patch('/:id/approve', approve);
router.patch('/:id/reject', reject);
router.delete('/:id', remove);

export default router;
