import express from 'express';
import priceController from '../controllers/priceController.js';

const router = express.Router();

// Public routes
router.get('/current', priceController.getCurrentPrice.bind(priceController));
router.get('/history', priceController.getPriceHistory.bind(priceController));
router.get('/chart', priceController.getChartData.bind(priceController));
router.get('/statistics', priceController.getPriceStatistics.bind(priceController));
router.get('/compare', priceController.comparePrices.bind(priceController));

// Protected routes (optional)
router.post('/refresh', priceController.refreshPrice.bind(priceController));

export default router;