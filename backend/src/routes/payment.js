const router = require('express').Router();
const ctrl = require('../controllers/paymentController');
const { optionalAuthenticate } = require('../middleware/auth');

router.post('/create-order', optionalAuthenticate, ctrl.createOrder);
router.post('/verify-payment', ctrl.verifyPayment);

module.exports = router;
