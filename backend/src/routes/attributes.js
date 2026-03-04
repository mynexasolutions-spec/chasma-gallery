const router = require('express').Router();
const c = require('../controllers/attributesController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin', 'manager'));

// Attributes
router.get('/',       c.getAll);
router.get('/:id',    c.getOne);
router.post('/',      c.create);
router.put('/:id',    c.update);
router.delete('/:id', c.remove);

// Attribute values
router.get('/:id/values',                c.getValues);
router.post('/:id/values',               c.addValue);
router.put('/:attrId/values/:valueId',   c.updateValue);
router.delete('/:attrId/values/:valueId', c.removeValue);

module.exports = router;
