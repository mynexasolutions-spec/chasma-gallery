const router = require('express').Router();
const ctrl = require('../controllers/paymentController');

router.post('/create-order', ctrl.createOrder);
router.post('/verify-payment', ctrl.verifyPayment);

module.exports = router;
