const router = require('express').Router();
const c = require('../controllers/productsController');
const d = require('../controllers/productDetailsController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);

// ── Core product CRUD ─────────────────────────────────────────────────────────
router.get('/',     authorize('admin', 'manager'), c.getAll);
router.get('/:id',  authorize('admin', 'manager'), c.getOne);
router.post('/',    authorize('admin'),             c.create);
router.put('/:id',  authorize('admin'),             c.update);
router.delete('/:id', authorize('admin'),           c.remove);

// ── Product images ────────────────────────────────────────────────────────────
router.get('/:id/images',                    authorize('admin', 'manager'), d.getImages);
router.post('/:id/images',                   authorize('admin'), upload.array('images', 10), d.uploadImages);
router.put('/:id/images/:imageId/primary',   authorize('admin'), d.setPrimary);
router.delete('/:id/images/:imageId',        authorize('admin'), d.removeImage);

// ── Product variations ────────────────────────────────────────────────────────
router.get('/:id/variations',                authorize('admin', 'manager'), d.getVariations);
router.post('/:id/variations',               authorize('admin'), d.createVariation);
router.put('/:id/variations/:varId',         authorize('admin'), d.updateVariation);
router.delete('/:id/variations/:varId',      authorize('admin'), d.deleteVariation);

module.exports = router;
