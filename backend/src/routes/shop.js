const router = require('express').Router();
const ctrl = require('../controllers/shopController');

// All public – no authentication required
router.get('/featured', ctrl.getFeatured);
router.get('/new-arrivals', ctrl.getNewArrivals);
router.get('/categories', ctrl.getCategories);
router.get('/brands', ctrl.getBrands);
router.get('/products', ctrl.getProducts);
router.get('/products/:id', ctrl.getProduct);

module.exports = router;
