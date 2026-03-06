const router = require('express').Router();
const { login, storeLogin, register, logout, me } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/login', login);
router.post('/store-login', storeLogin);
router.post('/register', register);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);

module.exports = router;
