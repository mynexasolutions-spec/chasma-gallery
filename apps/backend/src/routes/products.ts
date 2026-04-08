import { Router } from 'express';
import { getAll, getOne, create, update, remove } from '../controllers/productsController';
import { uploadImages, getImages, setPrimary, removeImage, getVariations, createVariation, updateVariation, deleteVariation } from '../controllers/productDetailsController';
import { authenticate, authorize } from '../middleware/auth';
import upload from '../middleware/upload';
import validate from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

const router = Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', authenticate, authorize('admin'), validate(createProductSchema), create);
router.put('/:id', authenticate, authorize('admin'), validate(updateProductSchema), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

// Images
router.get('/:id/images', authenticate, authorize('admin', 'manager'), getImages);
router.post('/:id/images', authenticate, authorize('admin'), upload.array('images', 10), uploadImages);
router.put('/:id/images/:imageId/primary', authenticate, authorize('admin'), setPrimary);
router.delete('/:id/images/:imageId', authenticate, authorize('admin'), removeImage);

// Variations
router.get('/:id/variations', authenticate, authorize('admin', 'manager'), getVariations);
router.post('/:id/variations', authenticate, authorize('admin'), createVariation);
router.put('/:id/variations/:varId', authenticate, authorize('admin'), updateVariation);
router.delete('/:id/variations/:varId', authenticate, authorize('admin'), deleteVariation);

export default router;

