import { Router } from 'express';
import { getFeatured, getNewArrivals, getCategories, getBrands, getProducts, getProduct } from '../controllers/shopController';

const router = Router();

// All public – no authentication required
router.get('/featured', getFeatured);
router.get('/new-arrivals', getNewArrivals);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/products', getProducts);
router.get('/products/:id', getProduct);

export default router;
