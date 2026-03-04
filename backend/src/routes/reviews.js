const router = require('express').Router();
const c = require('../controllers/reviewsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'manager'));
router.get('/',              c.getAll);
router.patch('/:id/approve', c.approve);
router.patch('/:id/reject',  c.reject);
router.delete('/:id',        c.remove);

module.exports = router;
