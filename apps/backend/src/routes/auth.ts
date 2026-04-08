import { Router } from 'express';
import { login, storeLogin, register, logout, me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import validate from '../middleware/validate';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/store-login', validate(loginSchema), storeLogin);
router.post('/register', validate(registerSchema), register);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

export default router;

