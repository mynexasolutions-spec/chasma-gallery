const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/categoriesController');
const upload = require('../middleware/upload');

router.use(authenticate);

router.get('/',    authorize('admin', 'manager'), ctrl.getAll);
router.get('/:id', authorize('admin', 'manager'), ctrl.getOne);
router.post('/',   authorize('admin'), upload.single('image'), ctrl.create);
router.put('/:id', authorize('admin'), upload.single('image'), ctrl.update);
router.delete('/:id', authorize('admin'),         ctrl.remove);

module.exports = router;
