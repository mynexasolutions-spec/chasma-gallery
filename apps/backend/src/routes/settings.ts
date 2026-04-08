import { Router } from 'express';
import { getAll, upsert } from '../controllers/settingsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate, authorize('admin'));

router.get('/', getAll);
router.put('/', upsert);

export default router;
