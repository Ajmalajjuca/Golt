import express from 'express';
import priceController from '../controllers/priceController.js';

const router = express.Router();

// Public routes
router.get('/current/:metalType', priceController.getCurrentPrice.bind(priceController));
router.get('/history/:metalType', priceController.getPriceHistory.bind(priceController));
router.get('/chart/:metalType', priceController.getChartData.bind(priceController));
router.get('/statistics/:metalType', priceController.getPriceStatistics.bind(priceController));
router.get('/compare/:metalType', priceController.comparePrices.bind(priceController));
// Protected routes (optional)
router.post('/refresh/:metalType', priceController.refreshPrice.bind(priceController));

export default router;