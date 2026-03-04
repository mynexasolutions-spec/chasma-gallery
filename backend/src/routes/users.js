const router = require('express').Router();
const c = require('../controllers/usersController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'manager'));
router.get('/',                 c.getAll);
router.get('/:id',              c.getOne);
router.post('/',                c.create);
router.put('/:id',              c.update);
router.patch('/:id/status',     c.updateStatus);
router.delete('/:id',           c.remove);

module.exports = router;
