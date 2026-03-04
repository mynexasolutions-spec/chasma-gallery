const router = require('express').Router();
const c = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));
router.get('/',  c.getAll);
router.put('/',  c.upsert);

module.exports = router;
