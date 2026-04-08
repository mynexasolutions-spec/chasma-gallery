import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/categoriesController';
import { authenticate, authorize } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.use(authenticate);

router.get('/',    authorize('admin', 'manager'), getAll);
router.get('/:id', authorize('admin', 'manager'), getOne);
router.post('/',   authorize('admin'), upload.single('image'), create);
router.put('/:id', authorize('admin'), upload.single('image'), update);
router.delete('/:id', authorize('admin'), remove);

export default router;
