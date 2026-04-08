import { Router } from 'express';
import { getAll, getOne, create, update, updateStatus, remove } from '../controllers/usersController';
import { authenticate, authorize } from '../middleware/auth';
import validate from '../middleware/validate';
import { createUserSchema, updateUserSchema, updateUserStatusSchema } from '../schemas/user.schema';

const router = Router();

router.use(authenticate, authorize('admin', 'manager'));
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', validate(createUserSchema), create);
router.put('/:id', validate(updateUserSchema), update);
router.patch('/:id/status', validate(updateUserStatusSchema), updateStatus);
router.delete('/:id', remove);

export default router;

