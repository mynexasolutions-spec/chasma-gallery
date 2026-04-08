import { Router } from 'express';
import { createOrder, verifyPayment, createCODOrder } from '../controllers/paymentController';
import { optionalAuthenticate } from '../middleware/auth';

const router = Router();

router.post('/create-order', optionalAuthenticate, createOrder);
router.post('/create-cod-order', optionalAuthenticate, createCODOrder);
router.post('/verify-payment', verifyPayment);

export default router;
