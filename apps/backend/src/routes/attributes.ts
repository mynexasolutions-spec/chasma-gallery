import { Router } from 'express';
import { getAll, getOne, create, update, remove, getValues, addValue, updateValue, removeValue } from '../controllers/attributesController';
import { authenticate, authorize } from '../middleware/auth';
import validate from '../middleware/validate';
import { createAttributeSchema, createAttributeValueSchema } from '../schemas/attribute.schema';

const router = Router();
router.use(authenticate, authorize('admin', 'manager'));

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', validate(createAttributeSchema), create);
router.put('/:id', validate(createAttributeSchema), update);
router.delete('/:id', remove);

router.get('/:id/values', getValues);
router.post('/:id/values', validate(createAttributeValueSchema), addValue);
router.put('/:attrId/values/:valueId', validate(createAttributeValueSchema), updateValue);
router.delete('/:attrId/values/:valueId', removeValue);

export default router;

